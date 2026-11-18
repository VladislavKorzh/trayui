#!/usr/bin/env python3
"""Write the themes that come with the system into project/tokens.json, and measure them.

    python3 tools/themes.py            derive the themes below, rewrite tokens.json, report the contrasts
    python3 tools/themes.py --check    measure every theme of tokens.json and write nothing

Light and Dark were tuned by hand: this script never changes them, it only measures them. Every other theme is derived
from four colours (the page, the tray, the ink, the accent) by tools/site/theme.js, the same engine the Themes page of
the site runs in the browser, so a built-in theme and a theme somebody makes there follow the same rules. The script
stops, and writes nothing, when a theme misses one of them. It needs node. Run tools/build.py afterwards.
"""
import json, pathlib, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
TOKENS, ENGINE = ROOT / 'project' / 'tokens.json', ROOT / 'tools' / 'site' / 'theme.js'
BASE = ('light', 'dark')

# id, name, page, tray, ink, accent. A light theme has a pale page and dark ink; a dark theme the other way round.
THEMES = [
    ('linen', 'Linen', '#fefaf1', '#f4eee0', '#1c140c', '#ffae4e'),
    ('mint', 'Mint', '#f7fefa', '#e7f3ec', '#0a1a13', '#68efaf'),
    ('sky', 'Sky', '#f8fcff', '#e8f0f7', '#0c1723', '#78d0ff'),
    ('rose', 'Rose', '#fffafb', '#f8ecee', '#221317', '#ffa3ba'),
    ('lilac', 'Lilac', '#fcfbff', '#f1eef8', '#171324', '#caacff'),
    ('midnight', 'Midnight', '#090f1c', '#141d2e', '#f2f7fd', '#87d5ff'),
    ('forest', 'Forest', '#07120c', '#102117', '#f1f9f3', '#9ef269'),
    ('espresso', 'Espresso', '#140e09', '#241b13', '#fbf6ee', '#ffb657'),
]

NODE = '''
const T = require(process.argv[1]);
const input = JSON.parse(require('fs').readFileSync(0, 'utf8'));
const out = {};
for (const seed of input.seeds) { const tokens = T.derive(seed, input.base); out[seed.id] = { tokens, mode: T.modeOf(tokens.page) }; }
const reports = {};
for (const id of Object.keys(input.measure)) reports[id] = T.report(input.measure[id]);
for (const id of Object.keys(out)) reports[id] = T.report(out[id].tokens);
process.stdout.write(JSON.stringify({ derived: out, reports }));
'''


def engine(payload):
    try:
        done = subprocess.run(['node', '-e', NODE, str(ENGINE)], input=json.dumps(payload), capture_output=True, text=True)
    except FileNotFoundError:
        sys.exit('themes: node was not found; the theme engine is JavaScript, shared with the site')
    if done.returncode:
        sys.exit('themes: the engine failed:\n' + done.stderr)
    return json.loads(done.stdout)


def value_of(token, theme, first):
    v = token['value']
    return v if isinstance(v, str) else v.get(theme, v[first])


def main():
    check = '--check' in sys.argv
    tok = json.loads(TOKENS.read_text(encoding='utf-8'))
    colours = tok['color']['tokens']
    base = {m: {t['name']: value_of(t, m, 'light') for t in colours} for m in BASE}
    have = [t['id'] for t in tok['color']['themes']]
    seeds = [] if check else [{'id': i, 'page': page, 'surface': tray, 'ink': ink, 'accent': accent} for i, _name, page, tray, ink, accent in THEMES]
    measure = {th: {t['name']: value_of(t, th, 'light') for t in colours} for th in (have if check else BASE)}
    out = engine({'seeds': seeds, 'base': base, 'measure': measure})

    failed = False
    for theme, rows in out['reports'].items():
        bad = [r for r in rows if not r['ok']]
        tight = min(rows, key=lambda r: r['ratio'] / r['need'])
        print(f'{theme:9} {len(rows)} pairs, {len(bad)} missed; the tightest: {tight["token"]} on {tight["on"]} {tight["ratio"]:.2f} (needs {tight["need"]})')
        for r in bad:
            failed = True
            print(f'   MISSED {r["token"]} on {r["on"]}: {r["ratio"]:.2f}, needs {r["need"]}')
    if failed:
        sys.exit('themes: a theme misses a rule; nothing was written')
    if check:
        return

    names = {i: name for i, name, *_ in THEMES}
    order = list(BASE) + [i for i, *_ in THEMES]
    tok['color']['themes'] = [{'id': 'light', 'name': 'Light'}, {'id': 'dark', 'name': 'Dark'}] + [{'id': i, 'name': names[i]} for i in order[2:]]
    values = {th: (base[th] if th in BASE else out['derived'][th]['tokens']) for th in order}
    for t in colours:
        per = {th: values[th][t['name']] for th in order}
        t['value'] = per['light'] if len(set(per.values())) == 1 else per
    # what else differs by theme (the one shadow) follows the mode: a dark theme takes the dark value
    modes = {th: (th if th in BASE else out['derived'][th]['mode']) for th in order}
    for fam in ('shadow',):
        for t in tok.get(fam, {}).get('tokens', []):
            if isinstance(t['value'], dict):
                t['value'] = {th: t['value'][modes[th]] for th in order}
    TOKENS.write_text(json.dumps(tok, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    print(f'themes: {len(order)} themes in tokens.json ({", ".join(order)})')


if __name__ == '__main__':
    main()
