from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

output = Path('public/media/education')
output.mkdir(parents=True, exist_ok=True)
font_dir = Path('C:/Windows/Fonts')
font = lambda size: ImageFont.truetype(str(font_dir / 'segoeui.ttf'), size)
pink, deep, outline, skin = '#a60046', '#402630', '#765061', '#f1ced0'


def canvas(title, subtitle):
    image = Image.new('RGB', (1000, 645), '#fff6f8')
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((36, 34, 964, 611), 26, fill='#fffcfd', outline='#f2dce5', width=2)
    draw.text((75, 65), title, font=font(40), fill=deep)
    draw.text((76, 125), subtitle, font=font(24), fill=outline)
    return image, draw


def callout(draw, text, label, point):
    draw.line((label[0] + 10, label[1] - 8, point[0], point[1]), fill=pink, width=3)
    draw.ellipse((point[0]-6, point[1]-6, point[0]+6, point[1]+6), fill=pink)
    draw.text(label, text, font=font(22), fill=deep)


def head(draw):
    draw.ellipse((342, 186, 658, 526), fill=skin, outline=outline, width=4)
    draw.arc((358, 191, 642, 361), 170, 370, fill=outline, width=5)
    for x in (441, 558):
        draw.arc((x-29, 307, x+29, 345), 195, 346, fill=outline, width=4)
        draw.arc((x-26, 337, x+26, 361), 190, 350, fill=outline, width=3)
    draw.line((504, 357, 490, 401, 510, 406), fill=outline, width=3)
    draw.arc((458, 414, 542, 464), 12, 168, fill=outline, width=4)


def save(image, key):
    image.save(output / (key + '.webp'), quality=91)


for key, title, label, point in [
    ('hairline', 'Hair transplantation', 'Scalp and hairline', (500, 249)),
    ('male-hairline', 'Hairline and crown', 'Front hairline', (470, 247)),
    ('female-scalp', 'Scalp hair thinning', 'Central scalp', (518, 223)),
    ('eyebrow', 'Eyebrow transplantation', 'Eyebrow', (558, 325)),
    ('beard', 'Beard transplantation', 'Jawline and beard area', (530, 480)),
    ('moustache', 'Moustache transplantation', 'Upper lip', (533, 420)),
    ('dimple', 'Dimple creation', 'Cheek', (570, 426)),
]:
    image, draw = canvas(title, 'Illustration of the area discussed during consultation')
    head(draw)
    x, y = point
    draw.ellipse((x-23, y-20, x+23, y+20), fill='#e8a6bf', outline=pink, width=3)
    callout(draw, label, (680, 420), point)
    save(image, key)

image, draw = canvas('FUE hair transplant', 'A follicular unit can contain one or more hairs')
draw.rounded_rectangle((125, 329, 700, 506), 22, fill=skin, outline=outline, width=3)
for x in (260, 464):
    for shift in (-13, 13):
        draw.line((x+shift-18, 240, x+shift+18, 431), fill=outline, width=5)
        draw.ellipse((x+shift+9, 423, x+shift+28, 448), fill='#c16587')
draw.rounded_rectangle((399, 231, 520, 486), 38, outline=pink, width=4)
callout(draw, 'Individual follicular unit', (663, 235), (516, 255))
callout(draw, 'Skin surface', (731, 389), (676, 329))
save(image, 'fue')

image, draw = canvas('Lipoma', 'Illustration of a fatty lump beneath the skin')
for y, color in ((237, '#dca6b7'), (310, '#f4d6c7'), (408, '#f5e2b5')):
    draw.rounded_rectangle((100, y, 900, y+103), 19, fill=color)
draw.ellipse((345, 347, 595, 467), fill='#e6ae58', outline='#986039', width=4)
callout(draw, 'Lipoma', (694, 390), (573, 385))
callout(draw, 'Skin surface', (675, 190), (650, 239))
save(image, 'lipoma')

image, draw = canvas('Nipple inversion', 'Simplified cross-section of the nipple area')
draw.polygon([(125, 345), (365, 345), (419, 370), (454, 401), (487, 370), (544, 345), (876, 345), (876, 500), (125, 500)], fill=skin)
draw.line([(125, 345), (365, 345), (419, 370), (454, 401), (487, 370), (544, 345), (876, 345)], fill=outline, width=5, joint='curve')
callout(draw, 'Inward projection', (637, 232), (454, 401))
save(image, 'nipple-inversion')

for key, title, label, y in [('vaginal-opening', 'Hymenal tissue', 'Area around the vaginal opening', 465),
                              ('pelvic-floor', 'Pelvic floor', 'Pelvic floor support', 422)]:
    image, draw = canvas(title, 'Simplified pelvic anatomy for patient education')
    draw.arc((246, 204, 615, 503), 15, 163, fill=outline, width=12)
    draw.arc((250, 204, 612, 503), 195, 345, fill=outline, width=7)
    draw.ellipse((373, 261, 501, 357), fill=skin, outline=outline, width=4)
    draw.rounded_rectangle((413, 343, 459, 470), 19, fill=skin, outline=outline, width=4)
    draw.arc((282, 330, 577, 485), 15, 163, fill=pink, width=9)
    callout(draw, label, (613, 389), (436, y))
    save(image, key)

image, draw = canvas('Buttock fat grafting', 'Areas discussed during surgical planning')
draw.rounded_rectangle((359, 189, 648, 552), 98, fill=skin, outline=outline, width=4)
draw.line((502, 402, 502, 539), fill=outline, width=4)
for x in (427, 568):
    draw.ellipse((x-47, 365, x+47, 458), fill='#e8a6bf', outline=pink, width=3)
callout(draw, 'Gluteal region', (690, 405), (578, 417))
save(image, 'buttock')
