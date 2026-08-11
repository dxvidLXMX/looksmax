"""Generate app icons for Looksmax PWA (no external assets)."""
from PIL import Image, ImageDraw
import math, os

HERE = os.path.dirname(__file__)
BG1 = (110, 168, 254)   # accent blue
BG2 = (139, 123, 255)   # violet
DARK = (11, 13, 18)

def lerp(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))

def draw_icon(size, maskable=False):
    # supersample for smooth edges
    S = size * 4
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # diagonal gradient background
    grad = Image.new("RGB", (S, S), BG1)
    gp = grad.load()
    for y in range(S):
        for x in range(0, S, 1):
            t = (x + y) / (2 * S)
            gp[x, y] = lerp(BG1, BG2, t)

    # rounded square mask (maskable = full bleed, else inset with radius)
    mask = Image.new("L", (S, S), 0)
    md = ImageDraw.Draw(mask)
    if maskable:
        md.rounded_rectangle([0, 0, S, S], radius=0, fill=255)
    else:
        r = int(S * 0.22)
        md.rounded_rectangle([0, 0, S - 1, S - 1], radius=r, fill=255)
    img.paste(grad, (0, 0), mask)

    # draw a clean 4-point sparkle ("glow up") in dark
    cx, cy = S / 2, S / 2
    spikes = []
    R = S * 0.30
    r = S * 0.085
    for i in range(8):
        ang = math.pi / 2 * (i / 2)  # every 45deg
        rad = R if i % 2 == 0 else r
        spikes.append((cx + rad * math.cos(ang - math.pi / 2),
                       cy + rad * math.sin(ang - math.pi / 2)))
    d.polygon(spikes, fill=DARK + (255,))
    # center dot
    d.ellipse([cx - S*0.03, cy - S*0.03, cx + S*0.03, cy + S*0.03], fill=DARK + (255,))

    return img.resize((size, size), Image.LANCZOS)

def save(name, size, maskable=False):
    draw_icon(size, maskable).save(os.path.join(HERE, name))
    print("wrote", name)

save("icon-192.png", 192)
save("icon-512.png", 512)
save("icon-maskable-512.png", 512, maskable=True)
save("apple-touch-icon.png", 180)

# simple SVG version for the favicon
svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#6ea8fe"/><stop offset="1" stop-color="#8b7bff"/>
  </linearGradient></defs>
  <rect width="100" height="100" rx="22" fill="url(#g)"/>
  <path d="M50 18 L57 43 L82 50 L57 57 L50 82 L43 57 L18 50 L43 43 Z" fill="#0b0d12"/>
</svg>'''
with open(os.path.join(HERE, "icon.svg"), "w", encoding="utf-8") as f:
    f.write(svg)
print("wrote icon.svg")
