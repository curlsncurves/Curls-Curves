"""Import slide comparisons into the private local gallery. Requires Pillow."""
import argparse
from collections import Counter
from hashlib import sha256
from io import BytesIO
import json
from math import ceil, floor
from pathlib import Path
import posixpath
from concurrent.futures import ThreadPoolExecutor
import re
import xml.etree.ElementTree as ET
from zipfile import ZipFile

from PIL import Image, ImageDraw, ImageOps
from dedupe_case_gallery import deduplicate

NS = dict(p='http://schemas.openxmlformats.org/presentationml/2006/main',
          a='http://schemas.openxmlformats.org/drawingml/2006/main',
          r='http://schemas.openxmlformats.org/officeDocument/2006/relationships')
GROUPS = {
    'Axillary Breast': 'Axillary Breast Tissue Removal',
    'BA FG': 'Breast Augmentation by Fat Grafting',
    'Breast lift': 'Breast Lift',
    'Deep plane Face lift Neck lift Brow lift Blepharoplasty': 'Combined Face and Neck Rejuvenation',
    'Gynaecomastia': 'Gynecomastia',
    'Labia Mojora Augmentation': 'Labia Majora Augmentation',
    'Post bariatric surgeries': 'Post-Bariatric Surgery',
    'Thighs liposuction': 'Thigh Liposuction',
}
LIPO = {'3D Liposuction', 'HD liposuction', 'Ultrasonic liposuction'}
PHASE = re.compile(r'^(before|after|pre[- ]?op(?:erative)?|post[- ]?op(?:erative)?)\s*[:.]?$', re.I)


def position(element):
    transform = element.find('p:spPr/a:xfrm', NS)
    if transform is None:
        return None
    offset = transform.find('a:off', NS)
    extent = transform.find('a:ext', NS)
    if offset is None or extent is None:
        return None
    return tuple(int(part) for part in (offset.get('x'), offset.get('y'), extent.get('cx'), extent.get('cy')))


def intersects(first, second):
    x, y, width, height = first
    left, top, spread, depth = second
    return min(x + width, left + spread) > max(x, left) and min(y + height, top + depth) > max(y, top)


def phase_labels(tree, photos):
    tagged = {}
    for element in tree.findall('p:sp', NS):
        text = ' '.join(node.text or '' for node in element.findall('.//a:t', NS)).strip()
        if not PHASE.fullmatch(text):
            continue
        bounds = position(element)
        if bounds is None:
            continue
        center = bounds[0] + bounds[2] / 2
        nearest = min(range(len(photos)), key=lambda index: abs(center - photos[index][0][0] - photos[index][0][2] / 2))
        tag = 'Before' if text.lower().startswith(('before', 'pre')) else 'After'
        if nearest in tagged and tagged[nearest] != tag:
            return {}
        tagged[nearest] = tag
    return tagged if set(tagged.values()) == {'Before', 'After'} else {}


def encode(deck, slide_path, picture, relationships, masks, frame, cache):
    blip = picture.find('p:blipFill/a:blip', NS)
    if blip is None:
        raise ValueError('Missing picture reference')
    target = relationships[blip.get('{'+NS['r']+'}embed')]
    filename = posixpath.normpath(posixpath.join(posixpath.dirname(slide_path), target))
    raw = deck.read(filename)
    geometry = ET.tostring(picture.find('p:spPr/a:xfrm', NS))
    source_crop = picture.find('p:blipFill/a:srcRect', NS)
    key = (sha256(raw).digest(), geometry, ET.tostring(source_crop) if source_crop is not None else b'', tuple(masks))
    if key in cache:
        return cache[key]
    with Image.open(BytesIO(raw)) as source:
        photo = ImageOps.exif_transpose(source).convert('RGB')
    crop = picture.find('p:blipFill/a:srcRect', NS)
    if crop is not None:
        width, height = photo.size
        left, top, right, bottom = (max(0, int(crop.get(key, 0))) / 100000 for key in 'ltrb')
        photo = photo.crop((round(width * left), round(height * top), round(width * (1-right)), round(height * (1-bottom))))
    transform = picture.find('p:spPr/a:xfrm', NS)
    if transform.get('flipH') in ('1', 'true'):
        photo = ImageOps.mirror(photo)
    if transform.get('flipV') in ('1', 'true'):
        photo = ImageOps.flip(photo)
    if transform.get('rot'):
        photo = photo.rotate(-int(transform.get('rot')) / 60000, expand=True)
    if masks:
        if transform.get('rot'):
            raise ValueError('Cannot establish the mask position on a rotated picture')
        draw = ImageDraw.Draw(photo)
        x, y, width, height = frame
        for left, top, spread, depth in masks:
            # Cover the original shape's full bounds before shrinking the photo.
            x1 = max(0, floor((left - x) * photo.width / width) - 2)
            y1 = max(0, floor((top - y) * photo.height / height) - 2)
            x2 = min(photo.width, ceil((left + spread - x) * photo.width / width) + 2)
            y2 = min(photo.height, ceil((top + depth - y) * photo.height / height) + 2)
            draw.rectangle((x1, y1, x2, y2), fill='#151515')
    photo.thumbnail((1280, 1280), Image.Resampling.LANCZOS)
    buffer = BytesIO()
    photo.save(buffer, format='WEBP', quality=88, method=3)
    encoded = buffer.getvalue(), photo.size
    cache[key] = encoded
    return encoded


def import_decks(source, output):
    output.mkdir(parents=True, exist_ok=True)
    cases = []
    seen = {}
    skips = Counter()
    masked = 0
    cache = {}
    pool = ThreadPoolExecutor(max_workers=4)
    for filename in sorted(source.glob('*.pptx')):
        title = '3D, HD and Ultrasonic Liposuction' if filename.stem in LIPO else GROUPS.get(filename.stem, filename.stem.title())
        with ZipFile(filename) as deck:
            slides = [entry for entry in deck.namelist() if re.fullmatch(r'ppt/slides/slide\d+.xml', entry)]
            for entry in sorted(slides, key=lambda name: int(re.search(r'(\d+)\.xml$', name)[1])):
                tree = ET.fromstring(deck.read(entry)).find('p:cSld/p:spTree', NS)
                if tree is None:
                    continue
                photos = [(position(element), element) for element in tree.findall('p:pic', NS)]
                if len(photos) < 2 or any(frame is None for frame, _ in photos):
                    skips['title or single-photo slides'] += 1
                    continue
                # Preserve anything placed over a photo as an opaque mask.
                overlays = [node for node in tree if node.tag.rsplit('}', 1)[-1] in {'sp', 'grpSp', 'graphicFrame', 'cxnSp'}]
                if any(node.tag.rsplit('}', 1)[-1] in {'grpSp', 'graphicFrame'} for node in overlays):
                    skips['slides with unsupported overlays'] += 1
                    continue
                bounds = []
                supported = True
                for node in overlays:
                    rect = position(node)
                    if not rect or not any(intersects(rect, frame) for frame, _ in photos):
                        continue
                    if node.find('p:spPr/a:xfrm', NS).get('rot'):
                        supported = False
                        break
                    bounds.append(rect)
                if not supported:
                    skips['slides with unsupported overlays'] += 1
                    continue
                photos.sort(key=lambda photo: (photo[0][0], photo[0][1]))
                tags = phase_labels(tree, photos) if len(photos) == 2 else {}
                relation_path = posixpath.join('ppt/slides/_rels', posixpath.basename(entry) + '.rels')
                relations = {item.get('Id'):item.get('Target') for item in ET.fromstring(deck.read(relation_path))}
                try:
                    tasks = [pool.submit(encode, deck, entry, picture, relations,
                                         [rect for rect in bounds if intersects(frame, rect)], frame, cache)
                             for frame, picture in photos]
                    encoded = [task.result() for task in tasks]
                except (KeyError, OSError, ValueError, AttributeError):
                    skips['unreadable photo slides'] += 1
                    continue
                hashes = [sha256(data).hexdigest()[:24] for data, _ in encoded]
                if len(set(hashes)) != len(hashes):
                    skips['slides repeating the same photo'] += 1
                    continue
                identity = tuple(sorted(hashes))
                if identity in seen:
                    existing = seen[identity]
                    if title not in existing['procedures']:
                        existing['procedures'].append(title)
                    skips['duplicate comparisons'] += 1
                    continue
                images = []
                for index, (digest, (data, size)) in enumerate(zip(hashes, encoded)):
                    file = digest + '.webp'
                    local = output / file
                    if not local.exists():
                        local.write_bytes(data)
                    default = ('Left photo', 'Right photo')[index] if len(photos) == 2 else f'Photo {index+1}'
                    images.append(dict(file=file, width=size[0], height=size[1], label=tags.get(index, default)))
                case = dict(id=sha256(''.join(identity).encode()).hexdigest()[:16], procedures=[title], photos=images)
                cases.append(case)
                masked += bool(bounds)
                seen[identity] = case
    pool.shutdown()
    cases = deduplicate(cases, output)
    manifest = json.dumps(cases, ensure_ascii=False, indent=2)
    pending = output / 'manifest.pending'
    pending.write_text(manifest, encoding='utf-8')
    pending.replace(output / 'manifest.json')
    print(json.dumps(dict(comparisons=len(cases), groups=len({p for c in cases for p in c['procedures']}),
                          explicitly_labelled=sum(c['photos'][0]['label'] in {'Before','After'} for c in cases),
                          masked_comparisons=masked, skipped=dict(skips))))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    parser.add_argument('--output', type=Path, default=Path('data/case-gallery'))
    args = parser.parse_args()
    if not args.source.is_dir() or not any(args.source.glob('*.pptx')):
        parser.error('source must be a directory containing PowerPoint decks')
    import_decks(args.source, args.output)
