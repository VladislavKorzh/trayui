#!/usr/bin/env python3
"""Write the agent skill of Tray UI from the built site, so it says what the site says and never drifts from it.

    python3 tools/skill.py --site <built site> [--dist <folder>] [--out <folder>]    on its own, for a look at the result

tools/site.py calls write(OUT, DIST, facts) once the site's pages are written. From the Markdown of every page (the files
the site serves at each address with .md added) it writes:

  dist/skills/trayui/          the skill, which the npm package trayui carries: SKILL.md (skill/SKILL.template.md with the facts of
                               this build filled in), references/ (the site's Markdown by the same paths: the page at
                               /components/button.md is references/components/button.md), scripts/check.mjs and
                               scripts/rules.json (the markup checker and its rules, from dist/cli, which tools/build.py writes).
                               A command in it that fetches a package names a release (npx trayui@<this version>), where the
                               site's page says npx trayui: an agent runs the release the skill was written with, and a
                               directory that pins the skill to a commit has pinned what the skill runs as well.
  site/skills/trayui.zip       one folder, trayui/: the skill, and around it what makes it a Claude Code plugin as well
                               (.claude-plugin/plugin.json, README.md from skill/README.md, icon.png drawn from src/logo.svg).
                               The same file is the upload for claude.ai (a folder with SKILL.md at its root) and the archive a
                               marketplace installs (the plugin root one folder down; SKILL.md at that root loads as one skill).
  site/skills/marketplace.json a Claude Code marketplace with that one plugin, fetched from the zip and pinned by its sha256.
                               plugin.json names no version, so Claude Code takes the digest as the version: each build that
                               changes the skill is an update.

The zip is deterministic (sorted entries, one date, one mode), so an unchanged skill keeps its digest. Standard library only.
"""
import argparse, hashlib, io, json, pathlib, re, shutil, struct, sys, zipfile, zlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'skill'                       # SKILL.template.md and the plugin's README, written by hand, with {{marks}}.
                                              # The template is not called SKILL.md, so a crawler that walks the repository finds only the built skill
NOTE = re.compile(r'^> Part of Tray UI [^\n]*\n\n?', re.M)  # the line every Markdown page of the site carries under its title
SECTIONS = ('components', 'blocks', 'docs', 'charts')       # the site's folders of pages the skill carries
LISTS = ('components.md', 'blocks.md', 'docs.md', 'charts.md')
LEAVE_OUT = {'docs/changelog.md', 'docs/agents.md', 'docs/skill.md'}  # the history, and the pages about agents and this skill itself
STAMP = (1980, 1, 1, 0, 0, 0)                                # the one date of every entry in the zip
SHADCN = '4.23.0'                             # the release of the shadcn CLI the skill names: the one tools/cli_check.py last passed with
# a command that fetches a package: the four the pages name, which pinned() gives a release, and any at all, which unpinned() reads
NAMED = re.compile(r'\b(npx|npm install) (trayui-react|trayui|shadcn|recharts)(?:@latest)?(?![\w@-])(?!\.\w)')
RUNS = re.compile(r'\b(npx|bunx|npm exec|pnpm dlx|yarn dlx)((?: +-[\w-]+)*) +(@?[a-z][\w./-]*)(@[\w.-]+)?')
ADDS = re.compile(r'\b(npm (?:install|i|add)|pnpm add|yarn add|bun add)\b([^\n`]*)')


def defaults():
    """The facts of this build when site.py does not give them: from tools/links.json, tokens.json and icons.json."""
    links = json.loads((ROOT / 'tools' / 'links.json').read_text(encoding='utf-8'))
    tok = json.loads((ROOT / 'project' / 'tokens.json').read_text(encoding='utf-8'))
    version, site = links.get('version', '0.0.0'), links.get('site', '').rstrip('/')
    cdn = f'https://cdn.jsdelivr.net/npm/trayui@{version}' if links.get('npm') else site
    themes = [t['id'] for t in tok['color']['themes']]
    lock = json.loads((ROOT / 'react' / 'package-lock.json').read_text(encoding='utf-8'))  # the Recharts the charts are built and checked with
    return {'version': version, 'site': site, 'cdn': cdn, 'license': links.get('license', 'MIT'), 'author': links.get('author', ''),
            'shadcn': SHADCN, 'recharts': lock['packages']['node_modules/recharts']['version'],
            'author_url': links.get('author_url', ''), 'repo': links.get('repo', '') if links.get('public') else '',
            'themes': len(themes), 'theme_names': ', '.join(f'`{t}`' for t in themes[:-1]) + f' or `{themes[-1]}`',
            'icons': len(json.loads((ROOT / 'src' / 'icons.json').read_text(encoding='utf-8')))}


def fill(text, facts, where):
    """{{name}} stands for a fact of this build; a mark left unfilled stops the build."""
    text = re.sub(r'\{\{(\w+)\}\}', lambda m: str(facts[m.group(1)]) if m.group(1) in facts else m.group(0), text)
    left = re.search(r'\{\{\w+\}\}', text)
    if left:
        sys.exit(f'{where}: a mark is left unfilled: {left.group(0)}')
    return text


def pinned(text, facts):
    """A page with a release named in each command that fetches a package: this build's version for trayui and trayui-react,
    and for shadcn and Recharts the releases this build was proved with. Only the skill's copy: the site says npx trayui."""
    at = {'trayui': facts['version'], 'trayui-react': facts['version'], 'shadcn': facts['shadcn'], 'recharts': facts['recharts']}
    return NAMED.sub(lambda m: f'{m.group(1)} {m.group(2)}@{at[m.group(2)]}', text)


def unpinned(text):
    """The commands in a page that would fetch whatever release of a package is newest, each as it is written."""
    found = [m.group(0) for m in RUNS.finditer(text) if not re.match(r'@\d', m.group(4) or '')]
    for m in ADDS.finditer(text):
        for written in m.group(2).split():
            word = written.rstrip('.,;:)')
            if word.startswith('-'):
                continue
            if not re.fullmatch(r'@?[a-z][\w./-]*(@[\w.-]+)?', word):
                break  # the command has ended
            if not re.search(r'.@\d', word):
                found.append(f'{m.group(1)} {word}')
            if word != written:
                break  # so has the sentence
    return found


def pages(site):
    """The Markdown pages the skill carries: {path under references/: text}, each without the line about the site."""
    out = {}
    for name in LISTS:
        if (site / name).exists():
            out[name] = NOTE.sub('', (site / name).read_text(encoding='utf-8'), count=1)
    for section in SECTIONS:
        for f in sorted((site / section).rglob('*.md')):
            rel = f.relative_to(site).as_posix()
            if rel not in LEAVE_OUT:
                out[rel] = NOTE.sub('', f.read_text(encoding='utf-8'), count=1)
    return out


def icon_png(size=512):
    """src/logo.svg as a PNG: its rounded rectangles drawn with four rows of samples a pixel and exact cover across it."""
    svg = (ROOT / 'src' / 'logo.svg').read_text(encoding='utf-8')
    box = [float(v) for v in re.search(r'viewBox="([^"]+)"', svg).group(1).split()]
    scale = size / box[2]
    shapes = []
    for attrs in re.findall(r'<rect\b([^>]*)/?>', svg):
        a = dict(re.findall(r'([\w-]+)="([^"]*)"', attrs))
        x, y, w, h = (float(a.get(k, 0)) * scale for k in ('x', 'y', 'width', 'height'))
        r = min(float(a.get('rx', 0)) * scale, w / 2, h / 2)
        colour = a['fill'].lstrip('#')
        shapes.append((x, y, w, h, r, tuple(int(colour[i:i + 2], 16) for i in (0, 2, 4))))
    rows = []
    sub = 4
    for py in range(size):
        acc = [[0.0, 0.0, 0.0, 0.0] for _ in range(size)]  # premultiplied red, green, blue, alpha
        for x, y, w, h, r, (cr, cg, cb) in shapes:
            cover = [0.0] * size
            for s in range(sub):
                yy = py + (s + .5) / sub
                if not y <= yy < y + h:
                    continue
                dy = max(y + r - yy, yy - (y + h - r), 0)
                dx = r - (r * r - dy * dy) ** .5 if dy else 0
                a, b = x + dx, x + w - dx
                for px in range(max(0, int(a)), min(size, int(b) + 1)):
                    cover[px] += max(0.0, min(b, px + 1) - max(a, px)) / sub
            for px, c in enumerate(cover):
                if c:
                    c = min(c, 1.0)
                    p = acc[px]
                    p[0], p[1], p[2], p[3] = cr * c + p[0] * (1 - c), cg * c + p[1] * (1 - c), cb * c + p[2] * (1 - c), c + p[3] * (1 - c)
        line = bytearray(b'\0')
        for r_, g_, b_, a_ in acc:
            line += bytes((round(r_ / a_), round(g_ / a_), round(b_ / a_), round(a_ * 255)) if a_ else (0, 0, 0, 0))
        rows.append(bytes(line))
    chunk = lambda kind, data: struct.pack('>I', len(data)) + kind + data + struct.pack('>I', zlib.crc32(kind + data) & 0xffffffff)
    return (b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0))
            + chunk(b'IDAT', zlib.compress(b''.join(rows), 9)) + chunk(b'IEND', b''))


def zipped(files):
    """{path in the zip: bytes} as a zip that is the same byte for byte whenever its files are."""
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, 'w', zipfile.ZIP_DEFLATED) as z:
        for name in sorted(files):
            info = zipfile.ZipInfo(name, STAMP)
            info.compress_type, info.external_attr, info.create_system = zipfile.ZIP_DEFLATED, 0o644 << 16, 3
            z.writestr(info, files[name], compresslevel=9)
    return buf.getvalue()


def write(site, dist, facts=None, cli=None, out=None):
    """The skill into dist/skills/trayui, the plugin zip and the marketplace into <out or site>/skills. Returns a summary."""
    site, dist = pathlib.Path(site), pathlib.Path(dist)
    out = pathlib.Path(out) if out else site
    facts = dict(defaults(), **{k: v for k, v in (facts or {}).items() if v not in (None, '')})
    cli = pathlib.Path(cli) if cli else (dist / 'cli' if (dist / 'cli' / 'rules.json').exists() else ROOT / 'dist' / 'cli')
    refs = {p: pinned(text, facts) for p, text in pages(site).items()}
    facts.setdefault('components', sum(1 for p in refs if p.startswith('components/')))
    facts.setdefault('blocks', sum(1 for p in refs if re.fullmatch(r'blocks/[a-z]+-\d+\.md', p)))

    files = {'SKILL.md': fill((SOURCE / 'SKILL.template.md').read_text(encoding='utf-8'), facts, 'skill/SKILL.template.md').encode('utf-8')}
    files.update({f'references/{p}': text.encode('utf-8') for p, text in refs.items()})
    readme = fill((SOURCE / 'README.md').read_text(encoding='utf-8'), facts, 'skill/README.md').encode('utf-8')
    # every command a page gives that fetches a package names a release: one that does not stops the build, as an unfilled mark does
    loose = {rel: unpinned(data.decode('utf-8')) for rel, data in {**files, 'README.md': readme}.items() if rel.endswith('.md')}
    if any(loose.values()):
        sys.exit(f'the skill has commands that fetch a package without naming a release: { {k: v for k, v in loose.items() if v} }')
    for name in ('check.mjs', 'rules.json'):
        if not (cli / name).exists():
            sys.exit(f'{cli / name} is missing: run tools/build.py, which writes the checker and its rules')
        files[f'scripts/{name}'] = (cli / name).read_bytes()
    # every file SKILL.md names must be in it: a path under references/ or scripts/, or a page of the docs by its name alone
    said = files['SKILL.md'].decode('utf-8')
    named = {p for p in re.findall(r'`((?:references|scripts)/[\w./-]+\.(?:md|mjs|json))`', said)}
    named |= {f'references/docs/{n}' for n in re.findall(r'`([\w-]+\.md)`', said) if n != 'SKILL.md'}
    missing = sorted(n for n in named if n not in files)
    if missing:
        sys.exit(f'skill/SKILL.template.md names files the skill does not have: {missing}')

    folder = dist / 'skills' / 'trayui'
    if folder.exists():
        shutil.rmtree(folder)
    for rel, data in files.items():
        (folder / rel).parent.mkdir(parents=True, exist_ok=True)
        (folder / rel).write_bytes(data)

    # the plugin: the skill, a manifest, a README and an icon, in one folder of a zip
    site_url = facts['site']
    manifest = {'name': 'trayui', 'displayName': 'Tray UI',
                'description': f'Build screens with Tray UI, the design system in plain HTML and CSS: the markup and rules of its {facts["components"]} components, '
                               f'its {facts["blocks"]} blocks as whole pages, the tokens, and a checker for the markup.',
                'author': {'name': facts['author'] or 'Tray UI', **({'url': facts['author_url']} if facts['author_url'] else {})},
                'homepage': f'{site_url}/docs/skill', **({'repository': facts['repo']} if facts['repo'] else {}),
                'license': facts['license'], 'keywords': ['design-system', 'html', 'css', 'ui', 'accessibility', 'tray-ui'], 'icon': './icon.png'}
    plugin = {f'trayui/{rel}': data for rel, data in files.items()}
    plugin['trayui/.claude-plugin/plugin.json'] = (json.dumps(manifest, indent=2, ensure_ascii=False) + '\n').encode('utf-8')
    plugin['trayui/README.md'] = readme
    plugin['trayui/icon.png'] = icon_png()
    archive = zipped(plugin)
    digest = hashlib.sha256(archive).hexdigest()
    (out / 'skills').mkdir(parents=True, exist_ok=True)
    (out / 'skills' / 'trayui.zip').write_bytes(archive)
    market = {'name': 'trayui', 'owner': {'name': 'Tray UI', 'url': site_url},
              'description': 'Tray UI for AI agents: a skill to build screens with the design system in plain HTML and CSS.',
              'plugins': [{'name': 'trayui', 'source': {'source': 'archive', 'url': f'{site_url}/skills/trayui.zip', 'sha256': digest},
                           'description': manifest['description'], 'category': 'design', 'tags': ['design-system', 'html', 'css', 'accessibility'],
                           'homepage': f'{site_url}/docs/skill'}]}
    (out / 'skills' / 'marketplace.json').write_text(json.dumps(market, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    # the repository is a marketplace too, for claude plugin marketplace add <owner>/<repo> and the directories that look for
    # .claude-plugin/marketplace.json: the plugin is the skill's folder in dist/ (SKILL.md at its root loads as one skill),
    # and strict false makes this entry its manifest. Written only when the skill goes to the repository's own dist/.
    if pathlib.Path(dist).resolve() == (ROOT / 'dist').resolve():
        repo_market = {**market, 'plugins': [{'name': 'trayui', 'source': './' + folder.resolve().relative_to(ROOT.parent).as_posix(),
                                              'description': manifest['description'], 'author': manifest['author'],
                                              'homepage': manifest['homepage'], **({'repository': facts['repo']} if facts['repo'] else {}),
                                              'license': facts['license'], 'category': 'design', 'keywords': manifest['keywords'],
                                              'strict': False}]}
        (ROOT.parent / '.claude-plugin').mkdir(exist_ok=True)
        (ROOT.parent / '.claude-plugin' / 'marketplace.json').write_text(json.dumps(repo_market, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    return {'folder': str(folder), 'files': len(files), 'references': len(refs), 'kb': sum(map(len, files.values())) // 1024,
            'zip_kb': len(archive) // 1024, 'sha256': digest}


if __name__ == '__main__':
    ap = argparse.ArgumentParser(description='Write the Tray UI skill from a built site.')
    ap.add_argument('--site', default=str(ROOT / 'site'), help='the built site to read the Markdown from (default: site/)')
    ap.add_argument('--dist', default=str(ROOT / 'dist'), help='where skills/trayui goes (default: dist/)')
    ap.add_argument('--out', default=None, help='where skills/trayui.zip and skills/marketplace.json go (default: the site)')
    args = ap.parse_args()
    print(json.dumps(write(args.site, args.dist, out=args.out), indent=1))
