"""Collapse duplicate comparisons without dropping alternate views of a case."""
from itertools import permutations
import json
from pathlib import Path
import sys

from PIL import Image, ImageChops, ImageOps, ImageStat


def deduplicate(cases, folder):
    signatures = {}
    for case in cases:
        for photo in case['photos']:
            file = photo['file']
            if file in signatures:
                continue
            with Image.open(folder / file) as image:
                small = image.convert('RGB').resize((48, 48), Image.Resampling.LANCZOS)
                gray = list(ImageOps.grayscale(small).resize((9, 8)).get_flattened_data())
                bits = sum((gray[y*9+x] > gray[y*9+x+1]) << (y*8+x) for y in range(8) for x in range(8))
                signatures[file] = (bits, image.width/image.height, small)

    def same_photo(left, right):
        if left == right:
            return True
        a, ratio_a, image_a = signatures[left]
        b, ratio_b, image_b = signatures[right]
        if abs(ratio_a/ratio_b - 1) > 0.02 or (a ^ b).bit_count() > 4:
            return False
        delta = ImageChops.difference(image_a, image_b)
        return max(ImageStat.Stat(delta).mean) <= 1.6 and sum(delta.convert('L').histogram()[9:]) <= 48

    retained = []
    for case in cases:
        files = [photo['file'] for photo in case['photos']]
        duplicate = next((previous for previous, previous_files in retained
                          if len(files) == len(previous_files)
                          and any(all(same_photo(a, b) for a, b in zip(files, order))
                                  for order in permutations(previous_files))), None)
        if duplicate is None:
            retained.append((case, files))
        else:
            duplicate['procedures'] = list(dict.fromkeys(duplicate['procedures'] + case['procedures']))
    return [case for case, _ in retained]


if __name__ == '__main__':
    manifest = Path(sys.argv[1])
    cases = json.loads(manifest.read_text(encoding='utf-8'))
    unique = deduplicate(cases, manifest.parent)
    pending = manifest.with_suffix('.pending')
    pending.write_text(json.dumps(unique, ensure_ascii=False, indent=2), encoding='utf-8')
    pending.replace(manifest)
    print(f'{len(cases) - len(unique)} duplicate comparisons removed. {len(unique)} retained.')
