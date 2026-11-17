#!/usr/bin/env python3
"""Make the demo pictures and the demo film of the system from six photographs: a snail farm, a snail, eggs, caviar, roe and a shop.

    python3 tools/media.py

The Lightbox and Video Player previews need real pictures and a real film to show. The originals are photographs from
Wikimedia Commons, each in the public domain or under CC0, kept in tools/media/<scene>.jpg (at most 2400px on the long
side, no metadata) with their authors, pages and licences in tools/media/credits.json. Each is made into WebP (a full
size of at most 1600px and a 640px thumbnail), and all six are cut into a film with ffmpeg (about thirteen seconds):
each photograph cropped to 16:9 with a slow push in, a cross-fade between them, a quiet wind under them, and captions
in WebVTT. The poster is the film's first frame. CREDITS.md is written from credits.json.
Everything is written to project/assets/Media/. It needs Pillow with WebP, and ffmpeg with libx264.
"""
import json, pathlib, shutil, subprocess, sys
from PIL import Image, ImageOps

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'tools' / 'media'
OUT = ROOT / 'project' / 'assets' / 'Media'

# id, what the photograph shows (the alt text the previews use), the line of the film
SCENES = [
    ('beds', 'Rows of leafy green snail beds on a hillside, each fenced with black net, a metal fence in front', 'The beds are fenced with fine net, row by row.'),
    ('snail', 'A brown-striped garden snail crawling along a wet green leaf', 'A snail needs damp, shade and green leaves.'),
    ('sieve', 'Thousands of pale trout eggs under water in a cream plastic tray', 'Fresh eggs firm up in a tray of water.'),
    ('jar', 'A small jar of black caviar on crushed ice in a glass dish, crackers, brie and pâté beside it', 'Caviar keeps best in a jar on crushed ice.'),
    ('spoon', 'Glossy orange salmon roe in a bowl, a teaspoon resting in it', 'Serve roe cold, a spoonful at a time.'),
    ('shop', 'The counter of an old country shop: a brass scale, barrels underneath, shelves of jars, tins and bottles behind', 'Then on to the counter of a country shop.'),
]


def run(*args):
    done = subprocess.run(args, capture_output=True, text=True)
    if done.returncode:
        sys.exit(f'media: {args[0]} failed:\n{done.stderr[-1500:]}')


def credits_md(credits):
    lines = ['# Credits', '',
             'The demo pictures of the Lightbox and Video Player previews are photographs from Wikimedia Commons, each in the public domain or under CC0.',
             'Written by tools/media.py from tools/media/credits.json, where the originals are kept.', '']
    for name, *_ in SCENES:
        c = credits[name]
        lines.append(f'- {name}: {c["shows"]}. By {c["author"]}, [{c["title"]}]({c["page"]}) on {c["source"]}, [{c["licence"]}]({c["licence_url"]}).')
    lines += ['', 'farm.mp4 and farm-poster.webp are cut from these six photographs; the wind under the film is generated noise.', '']
    return '\n'.join(lines)


def main():
    if not shutil.which('ffmpeg'):
        sys.exit('media: ffmpeg was not found')
    credits = {c['scene']: c for c in json.loads((SRC / 'credits.json').read_text(encoding='utf-8'))['photos']}
    for name, *_ in SCENES:
        if not (SRC / f'{name}.jpg').is_file():
            sys.exit(f'media: tools/media/{name}.jpg is missing')
        if name not in credits:
            sys.exit(f'media: tools/media/credits.json does not credit {name}')
    OUT.mkdir(parents=True, exist_ok=True)
    for name, _alt, _line in SCENES:
        im = Image.open(SRC / f'{name}.jpg').convert('RGB')
        full = im.copy(); full.thumbnail((1600, 1600), Image.LANCZOS)
        full.save(OUT / f'{name}.webp', 'WEBP', quality=80, method=6)
        th = im.copy(); th.thumbnail((640, 640), Image.LANCZOS)
        th.save(OUT / f'{name}-thumb.webp', 'WEBP', quality=76, method=6)
        print(f'{name}: {full.width}x{full.height}, {(OUT / f"{name}.webp").stat().st_size // 1024} KB; '
              f'thumbnail {th.width}x{th.height}, {(OUT / f"{name}-thumb.webp").stat().st_size // 1024} KB')

    # the film: each photograph cropped to 16:9 and pushed in slowly for 2.7 s, 0.6 s cross-fades, 1280 by 720 at 25 frames a second
    each, fade, fps = 2.7, 0.6, 25
    frames = int(each * fps)
    inputs, chains = [], []
    for i, (name, *_rest) in enumerate(SCENES):
        inputs += ['-loop', '1', '-framerate', str(fps), '-t', str(each), '-i', str(SRC / f'{name}.jpg')]
        chains.append(f'[{i}:v]scale=1920:1080:force_original_aspect_ratio=increase:flags=lanczos,crop=1920:1080,setsar=1,'
                      f"zoompan=z='1+0.07*on/{frames}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1280x720:fps={fps},"
                      f'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p[v{i}]')
    last, offset = 'v0', each - fade
    for i in range(1, len(SCENES)):
        chains.append(f'[{last}][v{i}]xfade=transition=fade:duration={fade}:offset={offset:.2f}[x{i}]')
        last, offset = f'x{i}', offset + each - fade
    total = each * len(SCENES) - fade * (len(SCENES) - 1)
    chains.append(f'anoisesrc=color=brown:amplitude=0.05:duration={total:.2f}:seed=14,lowpass=f=500,volume=0.6,'
                  f'afade=t=in:d=1.5,afade=t=out:st={total - 1.5:.2f}:d=1.5[a]')
    run('ffmpeg', '-y', *inputs, '-filter_complex', ';'.join(chains), '-map', f'[{last}]', '-map', '[a]',
        '-c:v', 'libx264', '-preset', 'slow', '-crf', '32', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
        '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
        '-c:a', 'aac', '-b:a', '48k', '-movflags', '+faststart', '-t', f'{total:.2f}', str(OUT / 'farm.mp4'))
    # the poster: the film's first frame, the first photograph cropped to 16:9 at the size of the film
    poster = ImageOps.fit(Image.open(SRC / f'{SCENES[0][0]}.jpg').convert('RGB'), (1280, 720), Image.LANCZOS)
    poster.save(OUT / 'farm-poster.webp', 'WEBP', quality=72, method=6)
    # the captions: one line a scene, while it is on screen
    def stamp(s):
        return f'00:{int(s // 60):02d}:{s % 60:06.3f}'
    cues, start = ['WEBVTT', ''], 0.0
    for i, (_n, _a, line) in enumerate(SCENES):
        end = start + each - (fade if i < len(SCENES) - 1 else 0)
        cues += [str(i + 1), f'{stamp(start + .2)} --> {stamp(end - .1)}', line, '']
        start = end
    (OUT / 'farm.en.vtt').write_text('\n'.join(cues), encoding='utf-8')
    (OUT / 'CREDITS.md').write_text(credits_md(credits), encoding='utf-8')
    print(f'farm.mp4: {total:.1f} s, {(OUT / "farm.mp4").stat().st_size // 1024} KB; poster {(OUT / "farm-poster.webp").stat().st_size // 1024} KB; '
          f'captions {len(SCENES)} cues; CREDITS.md')


if __name__ == '__main__':
    main()
