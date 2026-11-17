#!/usr/bin/env python3
"""Write src/icons.json from Lucide, as react-icons carries it: the icons the system builds into its sprite.

    python3 tools/lucide.py            rewrite src/icons.json
    python3 tools/lucide.py --check    say what would change, and write nothing

The icons of the system are Lucide's (https://lucide.dev, ISC licence). In React any of them comes from `react-icons/lu`;
a plain-HTML page has no such import, so the ones the components, blocks and templates use are built into the script as a
sprite. ICONS below is that list, by Lucide's own names. The drawings are read from the copy of react-icons installed in
react/node_modules (npm ci there first), so the sprite and `react-icons/lu` are the same drawings.
Run tools/build.py afterwards.
"""
import json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'react' / 'node_modules' / 'react-icons' / 'lu' / 'index.mjs'
OUT = ROOT / 'src' / 'icons.json'

ICONS = '''
chevron-down chevron-up chevron-left chevron-right chevrons-up-down arrow-left arrow-right arrow-up arrow-down arrow-up-right arrow-up-down
check x plus minus search menu ellipsis ellipsis-vertical grip-vertical external-link link copy pencil trash-2 download upload rotate-cw share send
house inbox layers layout-grid list columns-2 panel-left settings filter calendar clock bell bookmark flag tag hash at-sign
user users user-plus building mail phone message-square mic megaphone life-buoy circle-help info triangle-alert circle-alert circle-check circle-x circle
lock key shield shield-check eye eye-off log-in log-out credit-card receipt-text dollar-sign percent gift shopping-bag package truck map-pin globe
file folder image paperclip book code terminal database git-branch plug zap sparkle star heart thumbs-up thumbs-down
chart-column trending-up trending-down loader-circle play pause volume-2 volume-x captions maximize minimize sun moon monitor bold italic underline align-left align-center align-right
'''.split()

SHAPES = ('path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse')


def component(name):
    """house -> LuHouse, columns-2 -> LuColumns2: the name react-icons gives the icon."""
    return 'Lu' + ''.join(part.capitalize() for part in name.split('-'))


def read_source():
    if not SOURCE.exists():
        sys.exit('lucide: react-icons is not installed: run `npm ci` in react/ first')
    found = {}
    for m in re.finditer(r'export function (Lu\w+) \(props\) \{\s*return GenIcon\((\{.*?\})\)\(props\);', SOURCE.read_text(encoding='utf-8'), re.S):
        found[m.group(1)] = json.loads(m.group(2))
    return found


def markup(node):
    """The children of an icon as SVG markup. The frame (a 24px box, no fill, a round stroke) is the sprite's, not the icon's."""
    out = []
    for child in node['child']:
        if child['tag'] not in SHAPES or child['child']:
            sys.exit(f'lucide: an icon holds <{child["tag"]}>, which the sprite does not expect')
        attrs = ' '.join(f'{k}="{v}"' for k, v in child['attr'].items() if k != 'key')
        out.append(f'<{child["tag"]} {attrs}/>')
    return ''.join(out)


def main():
    source = read_source()
    missing = [n for n in ICONS if component(n) not in source]
    if missing:
        sys.exit(f'lucide: react-icons has no {", ".join(missing)}')
    repeated = sorted({n for n in ICONS if ICONS.count(n) > 1})
    if repeated:
        sys.exit(f'lucide: listed twice: {", ".join(repeated)}')
    icons = {}
    for name in ICONS:
        frame = source[component(name)]['attr']
        if frame.get('viewBox') != '0 0 24 24':
            sys.exit(f'lucide: {name} is not drawn on a 24px box')
        icons[name] = markup(source[component(name)])
    old = json.loads(OUT.read_text(encoding='utf-8')) if OUT.exists() else {}
    changed = sorted(n for n in icons if old.get(n) != icons[n])
    gone = sorted(set(old) - set(icons))
    print(f'lucide: {len(icons)} icons; {len(changed)} new or redrawn; no longer in the set: {", ".join(gone) or "none"}')
    if '--check' not in sys.argv:
        OUT.write_text(json.dumps(icons, indent=1, ensure_ascii=False) + '\n', encoding='utf-8')


if __name__ == '__main__':
    main()
