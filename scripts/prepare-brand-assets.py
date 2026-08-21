from pathlib import Path
from PIL import Image

root = Path('/home/ubuntu/Dropflow')
source = root / 'brand' / 'dropflow-icon-concept.png'
public_icons = root / 'public' / 'icons'
src_images = root / 'src' / 'assets' / 'images'
public_icons.mkdir(parents=True, exist_ok=True)
src_images.mkdir(parents=True, exist_ok=True)

image = Image.open(source).convert('RGBA')
pixels = image.load()
for y in range(image.height):
    for x in range(image.width):
        r, g, b, a = pixels[x, y]
        if r >= 245 and g >= 245 and b >= 245:
            pixels[x, y] = (255, 255, 255, 0)

sizes = {
    'favicon-32.png': 32,
    'favicon-48.png': 48,
    'apple-touch-icon.png': 180,
    'apple-touch-icon-167.png': 167,
    'apple-touch-icon-152.png': 152,
    'icon-192.png': 192,
    'icon-512.png': 512,
}
for name, size in sizes.items():
    resized = image.resize((size, size), Image.Resampling.LANCZOS)
    resized.save(public_icons / name, optimize=True)

# Vite-imported source used by the loading splash, sidebar and onboarding.
image.resize((512, 512), Image.Resampling.LANCZOS).save(src_images / 'dropflow-icon.png', optimize=True)
print('Prepared:', ', '.join(sizes.keys()))
print('Prepared:', src_images / 'dropflow-icon.png')
