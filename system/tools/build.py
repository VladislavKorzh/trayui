#!/usr/bin/env python3
"""Build the design system's generated files from src/ and check the result.

    python3 tools/build.py          build dist/, the icons, the React package's generated sources; run the checks

Sources:  project/tokens.json -> dist/tokens.css                 (and .preview/tokens.css, with the font inlined, for the checks)
          src/css/*.css       -> dist/components/bundle.css      (concatenated in name order)
          src/js/*.js         -> dist/components/bundle.js       (one classic script, window.TrayUI)
          src/icons.json      -> project/assets/Icons/*.svg and the sprite inside bundle.js
          project/blocks/*.html -> dist/blocks/, and their list in project/guides/5-blocks.md
"""
import json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
P, SRC, PREV = ROOT / 'project', ROOT / 'src', ROOT / '.preview'
NAMESPACE = 'TrayUI'
# Groups in the order they are listed: the base set, then the application set.
GROUPS = ['Actions', 'Forms', 'Navigation', 'Overlays', 'Feedback', 'Data', 'Layout', 'Display', 'Conversation',
          'App shell', 'Metrics', 'Billing', 'Account', 'Onboarding', 'Marketing']
EXPECTED = '''Accordion Alert AlertDialog AspectRatio Attachment Avatar Badge Breadcrumb Bubble Button ButtonGroup Calendar
Card Carousel Chart Checkbox CodeBlock Collapsible Combobox Command ContextMenu DataTable DatePicker Dialog Direction
Drawer DropdownMenu Empty Field HoverCard Input InputGroup InputOTP Item Kbd Label Marker Menubar Message MessageScroller
NativeSelect NavigationMenu Pagination Popover Progress Questionnaire RadioGroup Resizable ScrollArea Select Separator
Sheet Sidebar Skeleton Slider Spinner Switch Table Tabs Textarea Toast Toggle ToggleGroup Tooltip Trace Typography'''.split()
# The application set: what a product needs around the base components.
EXPECTED += '''AppShell TopBar PageHeader WorkspaceSwitcher UserMenu NotificationCenter FilterBar Stepper Banner
StatCard UsageMeter ActivityFeed DescriptionList Uptime PricingTable PlanComparison BillingSummary PaymentMethod InvoiceList
CheckoutSummary UpgradePrompt AuthForm TeamMembers InviteForm ApiKeys SettingsSection IntegrationCard NotificationPreferences
OnboardingChecklist Tour FeedbackWidget Changelog CookieConsent TagInput FileUpload Hero FeatureGrid Testimonial CallToAction
Footer'''.split()
# Media: pictures in a lightbox, and a film with the system's controls.
EXPECTED += '''Lightbox VideoPlayer'''.split()


# A folder in project/components that is not a component: a cover card that a design tool may show first. It is not
# part of the repository; where it exists, it has a preview and nothing else.
COVER = 'Cover'

# Blocks: screens built from the system. Their groups, in the order they are listed.
BLOCK_GROUPS = ['Dashboard', 'Stats', 'Tables', 'Settings', 'Empty states', 'Sidebar', 'Login', 'Signup', 'Pricing',
                'Catalog', 'Shop', 'Checkout', 'Articles', 'Article', 'Blog', 'Wiki']
PAGE_HEAD = ['<!doctype html>', '<html lang="en" data-theme="light">', '<head>', '<meta charset="utf-8">',
             '<meta name="viewport" content="width=device-width, initial-scale=1">']
PAGE_LINKS = ['<link rel="stylesheet" href="../tokens.css">', '<link rel="stylesheet" href="../components/bundle.css">', '</head>']


def read_blocks():
    """The blocks, in the order they are listed: id, title, summary, group, the file's text, problems."""
    out = []
    for f in sorted((P / 'blocks').glob('*.html')):
        text = f.read_text(encoding='utf-8')
        get = lambda name: (re.search(rf'<meta name="{name}" content="([^"]*)"', text) or [None, ''])[1]
        title = re.search(r'<title>([^<]*)</title>', text)
        page = {'name': f.stem, 'id': 'b-' + f.stem, 'title': title.group(1).strip() if title else '',
                'summary': get('description'), 'group': get('tray-category'), 'source': text, 'problems': [],
                'behaviours': sorted({b for v in re.findall(r'data-tray="([^"]+)"', text) for b in v.split()}), 'slots': 'tray-slot' in text}
        lines = text.split('\n')
        if lines[:5] != PAGE_HEAD or [l for l in lines[5:14] if l.startswith('<link') or l == '</head>'] != PAGE_LINKS:
            page['problems'].append('its <head> is not the one every page shares')
        for key in ('title', 'summary', 'group'):
            if not page[key]:
                page['problems'].append(f'no {key}')
        if page['group'] and page['group'] not in BLOCK_GROUPS:
            page['problems'].append(f'its category {page["group"]!r} has no place in the list')
        if '<script src="../components/bundle.js"></script>' not in text:
            page['problems'].append('it does not load ../components/bundle.js at the end of the body')
        if re.search(r'<style[\s>]', text):
            page['problems'].append('it carries a <style> element: styles belong to the system')
        out.append(page)
    return sorted(out, key=lambda x: (BLOCK_GROUPS.index(x['group']) if x['group'] in BLOCK_GROUPS else 99, x['name']))


def dark_themes(tok):
    """The themes whose page is dark: white reads better on it than black does."""
    def lum(value):
        c = [int(value[i:i + 2], 16) / 255 for i in (1, 3, 5)]
        c = [x / 12.92 if x <= .04045 else ((x + .055) / 1.055) ** 2.4 for x in c]
        return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]
    page = next(t for t in tok['color']['tokens'] if t['name'] == 'page')['value']
    first = tok['color']['themes'][0]['id']
    return [t['id'] for t in tok['color']['themes'] if 1.05 / (lum(page.get(t['id'], page[first])) + .05) > (lum(page.get(t['id'], page[first])) + .05) / .05]


# More contrast: a grey takes the value its theme gives the step after it, towards the ink. A rule stays at least 3:1.
MORE = [('ink-soft', 'ink'), ('ink-muted', 'ink-soft'), ('ink-hint', 'ink-muted'), ('control-off', 'ink-hint'), ('rule-strong', 'ink-hint'),
        ('hairline', 'control-off'), ('track', 'rule-strong'), ('on-dark-soft', 'on-inverse'), ('on-dark-muted', 'on-dark-soft'), ('dark-rule', 'on-dark-muted')]


def tokens_css(tok, font_base):
    """tokens.json -> CSS, laid out as the Design System page compiles it."""
    themes = [t['id'] for t in tok['color']['themes']]
    first = themes[0]
    alias = lambda v: re.sub(r'^\{([^}]+)\}$', r'var(--\1)', v)
    out = [f'/* {tok["name"]} — generated from tokens.json */']
    themed = [t for fam in ('color', 'shadow') for t in tok.get(fam, {}).get('tokens', [])]
    dark = dark_themes(tok)
    rows = [f'  --{t["name"]}: {alias(t["value"] if isinstance(t["value"], str) else t["value"][first])};' for t in themed]
    out.append(f':root, [data-theme="{first}"] {{\n  color-scheme: {"dark" if first in dark else "light"};\n' + '\n'.join(rows) + '\n}')
    for th in themes[1:]:
        # every token that differs between themes, also where this theme agrees with the first: a part of a page in this
        # theme must not take the value of another theme around it
        rows = [f'  --{t["name"]}: {alias(t["value"].get(th, t["value"][first]))};' for t in themed if isinstance(t['value'], dict)]
        out.append(f'[data-theme="{th}"] {{\n  color-scheme: {"dark" if th in dark else "light"};\n' + '\n'.join(rows) + '\n}')
    # more contrast: each grey takes the value of the next step towards the ink, in the theme's own colours (the site's theme
    # maker does the same with MORE in tools/site/theme.js)
    value = lambda t, th: t['value'] if isinstance(t['value'], str) else t['value'].get(th, t['value'][first])
    colours = {t['name']: t for t in tok['color']['tokens']}
    blocks = []
    for th in themes:
        rows = [f'    --{a}: {alias(value(colours[b], th))};' for a, b in MORE if a in colours and b in colours]
        blocks.append(f'  {":root, " if th == first else ""}[data-theme="{th}"] {{\n' + '\n'.join(rows) + '\n  }')
    out.append('@media (prefers-contrast: more) {\n' + '\n'.join(blocks) + '\n}')
    # print: ink on paper, so every themed token takes its value in the first (light) theme, whatever the page wears;
    # the doubled selectors outrank a theme rule that comes later, such as one a visitor made
    rows = [f'    --{t["name"]}: {alias(value(t, first))};' for t in themed if isinstance(t['value'], dict)]
    out.append('@media print {\n  :root:root, [data-theme][data-theme] {\n    color-scheme: light;\n' + '\n'.join(rows) + '\n  }\n}')
    rows = []
    for fam, body in tok.items():
        if fam in ('color', 'shadow', 'type') or not isinstance(body, dict) or 'tokens' not in body:
            continue
        rows += [f'  --{t["name"]}: {t["value"]};' for t in body['tokens']]
    rows += [f'  --font-{k}: {v};' for k, v in tok['type']['families'].items()]
    out.append(':root {\n' + '\n'.join(rows) + '\n}')
    for g in tok['type']['groups']:
        for s in g['styles']:
            d = [f'font-family: var(--font-{s.get("family", g["family"])})', f'font-size: {s["fontSize"]}',
                 f'line-height: {s["lineHeight"]}', f'font-weight: {s["fontWeight"]}']
            if 'letterSpacing' in s:
                d.append(f'letter-spacing: {s["letterSpacing"]}')
            out.append(f'.{s["name"]} {{ ' + '; '.join(d) + '; }')
    for f in tok['type']['fonts']:
        src = font_base + f['file']
        if font_base == 'data:':  # the local render check cannot read a font across file origins, so it gets the bytes inline
            import base64
            src = 'data:font/ttf;base64,' + base64.b64encode((P / f['file']).read_bytes()).decode()
        # a .woff2 beside the file (smaller by half) is offered first, the file itself after it
        woff2 = f['file'].rsplit('.', 1)[0] + '.woff2'
        if font_base != 'data:' and (P / woff2).exists():
            src = f'{font_base + woff2}") format("woff2"), url("{src}") format("truetype'
        out.append(f'@font-face {{ font-family: "{f["family"]}"; src: url("{src}"); '
                   f'font-weight: {f["weight"]}; font-style: {f.get("style", "normal")}; font-display: swap; }}')
    return '\n'.join(out) + '\n'


def build():
    problems = []
    tok = json.loads((P / 'tokens.json').read_text(encoding='utf-8'))
    PREV.mkdir(exist_ok=True)
    (PREV / 'tokens.css').write_text(tokens_css(tok, 'data:'), encoding='utf-8')

    # token names: unique across every family but type; legal characters
    names = [t['name'] for fam, body in tok.items() if isinstance(body, dict) and 'tokens' in body for t in body['tokens']]
    for n in sorted(set(x for x in names if names.count(x) > 1)):
        problems.append(f'token name used twice: {n}')
    for n in names:
        if not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9_.-]{0,63}', n):
            problems.append(f'illegal token name: {n}')
    defined = set(names) | {f'font-{k}' for k in tok['type']['families']}

    # icons
    icons = json.loads((SRC / 'icons.json').read_text(encoding='utf-8'))
    if (SRC / 'logo.svg').exists():  # the mark of the system, among its brand assets
        (P / 'assets' / 'Logos').mkdir(parents=True, exist_ok=True)
        (P / 'assets' / 'Logos' / 'trayui.svg').write_text((SRC / 'logo.svg').read_text(encoding='utf-8'), encoding='utf-8')
    icon_dir = P / 'assets' / 'Icons'
    icon_dir.mkdir(parents=True, exist_ok=True)
    for old in icon_dir.glob('*.svg'):
        if old.stem not in icons:
            old.unlink()
    for name, inner in icons.items():
        (icon_dir / f'{name}.svg').write_text(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" '
            f'stroke="#141414" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">{inner}</svg>\n', encoding='utf-8')
    icon_js = '  /* Icons: Lucide\'s (https://lucide.dev, ISC licence), from src/icons.json. Use <svg class="tray-icon"><use href="#tray-i-NAME"/></svg>. */\n' \
              '  UI.icons = ' + json.dumps(icons, separators=(',', ':')) + ';\n'

    # bundle.css
    css_parts = sorted((SRC / 'css').glob('*.css'))
    css = '/* Tray UI — component styles. Every colour, radius, size and space is a token from tokens.json;\n' \
          '   local names start with --tray-. Loaded after tokens.css. Built from src/css by tools/build.py. */\n\n'
    # Which themes are dark. tokens.css says it for each theme; these two rules, which give way to any other, are for a page
    # whose tokens come from somewhere else and do not say.
    css += ('/* ---------- Themes: light unless the theme is one of the dark ones ---------- */\n\n'
            ':where(:root, [data-theme]) { color-scheme: light; }\n'
            ':where(' + ', '.join(f'[data-theme="{th}"]' for th in dark_themes(tok)) + ') { color-scheme: dark; }\n\n')
    css += '\n'.join(p.read_text(encoding='utf-8').rstrip() + '\n' for p in css_parts)
    if re.search(r'</style', css, re.I):
        problems.append('bundle.css holds a literal </style')
    depth = 0
    for ch in re.sub(r'/\*.*?\*/', '', css, flags=re.S):
        depth += (ch == '{') - (ch == '}')
        if depth < 0:
            problems.append('bundle.css: a closing brace without an opening one'); break
    if depth > 0:
        problems.append('bundle.css: unclosed brace')

    # bundle.js
    js_parts = sorted((SRC / 'js').glob('*.js'))
    js = ('/* Tray UI — behaviours for the components. One classic script: it assigns window.TrayUI,\n'
          '   loads nothing, and wires up elements that carry a data-tray attribute. Built from src/js by tools/build.py. */\n'
          '(function () {\n  \'use strict\';\n  var UI = window.' + NAMESPACE + ' = window.' + NAMESPACE + ' || {};\n' + icon_js)
    js += '\n'.join(p.read_text(encoding='utf-8').rstrip() + '\n' for p in js_parts)
    js += '})();\n'
    for bad in ('</script', '<!--'):
        if bad in js.lower():
            problems.append(f'bundle.js holds a literal {bad}')

    # dist: the three files and the font, ready to link from any project, with the licences they travel under
    dist = ROOT / 'dist'
    (dist / 'components').mkdir(parents=True, exist_ok=True)
    (dist / 'fonts').mkdir(exist_ok=True)
    (dist / 'tokens.css').write_text(tokens_css(tok, ''), encoding='utf-8')
    (dist / 'components' / 'bundle.css').write_text(css, encoding='utf-8')
    (dist / 'components' / 'bundle.js').write_text(js, encoding='utf-8')
    for f in tok['type']['fonts']:
        for name in (f['file'], f['file'].rsplit('.', 1)[0] + '.woff2'):
            if (P / name).exists():
                (dist / name).write_bytes((P / name).read_bytes())
    if (SRC / 'LUCIDE-LICENSE.txt').exists():  # the licence of the icons travels with the script that holds them
        (dist / 'components' / 'LUCIDE-LICENSE.txt').write_text((SRC / 'LUCIDE-LICENSE.txt').read_text(encoding='utf-8'), encoding='utf-8')
    if (SRC / 'OFL.txt').exists():  # the licence of the typeface travels with every copy of its file
        for folder in (dist / 'fonts', P / 'fonts'):
            (folder / 'OFL.txt').write_text((SRC / 'OFL.txt').read_text(encoding='utf-8'), encoding='utf-8')
    if (ROOT.parent / 'LICENSE').exists():  # the licence of the system itself
        (dist / 'LICENSE').write_text((ROOT.parent / 'LICENSE').read_text(encoding='utf-8'), encoding='utf-8')
    # the tokens for other tools: a theme for Tailwind 4, a preset for Tailwind 3, and Figma variables (tools/exports.py)
    import exports
    exports.write(tok, dist, dark_themes(tok))

    # blocks: copies beside the three files in dist/, checks, and their list in the brand book
    page_used = set()
    kind = 'blocks'
    intro = 'A block is one screen-sized composition built only from the components and the layout classes: copy it into a product and fill it.'
    (P / kind).mkdir(exist_ok=True)
    (dist / kind).mkdir(exist_ok=True)
    pages = read_blocks()
    for old in (dist / kind).glob('*.html'):
        if not (P / kind / old.name).exists():
            old.unlink()
    for page in pages:
        text = page['source']
        (dist / kind / f'{page["name"]}.html').write_text(text, encoding='utf-8')
        for pr in page['problems']:
            problems.append(f'{kind}/{page["name"]}.html: {pr}')
        for tag in ('iframe', 'frame', 'object', 'embed', 'portal', 'img', 'picture', 'video'):
            if re.search(rf'<{tag}[\s>]', text, re.I):
                problems.append(f'{kind}/{page["name"]}.html: <{tag}> is not allowed in a page of the system')
        for url in re.findall(r'(?:src|href)="(https?://[^"]+)"', text):
            problems.append(f'{kind}/{page["name"]}.html: loads {url}')
        for ic in re.findall(r'#tray-i-([a-z0-9-]+)', text):
            if ic not in icons:
                problems.append(f'{kind}/{page["name"]}.html: unknown icon {ic}')
        for cls in sorted({c for v in re.findall(r'class="([^"]*)"', text) for c in v.split() if c.startswith('tray-')}):
            if not re.search(r'\.' + re.escape(cls) + r'(?![A-Za-z0-9_-])', css):
                problems.append(f'{kind}/{page["name"]}.html: class {cls} is not in the stylesheet')
        for st in re.findall(r'style="([^"]*)"', text):
            if re.search(r'#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(|(?<![-\w])(?:color|background(?:-color)?|font(?:-family|-size|-weight)?|border(?:-[a-z-]+)?|box-shadow)\s*:', st):
                problems.append(f'{kind}/{page["name"]}.html: an inline style sets a colour, a font, a border or a shadow: {st[:60]}')
        page_used |= set(re.findall(r'var\(--([A-Za-z0-9_.-]+)', text))
    lines = ['# Blocks', '', intro + f' There are {len(pages)}; each is one file in `{kind}/`.', '',
             'A page links `../tokens.css`, `../components/bundle.css` and `../components/bundle.js`, so it works as it is one folder below those three files. '
             'The grey trays (`tray-slot`) in a block stand in for your content.']
    for g in BLOCK_GROUPS:
        rows = [x for x in pages if x['group'] == g]
        if rows:
            lines += ['', f'## {g}', '', '| File | What it is |', '| --- | --- |'] + [f'| `{kind}/{x["name"]}.html` | {x["title"]}. {x["summary"]} |'.replace('|.', '|') for x in rows]
    (P / 'guides' / '5-blocks.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')

    # react: the same behaviours as a module, the icons as typed data, and one stylesheet, for the React package to build from
    react = ROOT / 'react'
    if (react / 'package.json').exists():
        body = '\n'.join(p.read_text(encoding='utf-8').rstrip() + '\n' for p in js_parts)
        (react / 'src' / 'runtime.ts').write_text(
            '// @ts-nocheck\n/* Generated by tools/build.py from src/js: the behaviours of the plain-HTML system, as a module. Do not edit. */\n'
            'const UI: any = {};\n'
            "if (typeof document !== 'undefined') (function () {\n  'use strict';\n" + icon_js + body + '})();\nexport default UI;\n', encoding='utf-8')
        (react / 'src' / 'icons.ts').write_text(
            '/* Generated by tools/build.py from src/icons.json. Do not edit. */\n'
            'export const icons = ' + json.dumps(icons, indent=1) + ' as const;\n\n/** The name of an icon in the set. */\nexport type IconName = keyof typeof icons;\n', encoding='utf-8')
        (react / 'styles' / 'fonts').mkdir(parents=True, exist_ok=True)
        (react / 'styles' / 'styles.css').write_text(tokens_css(tok, '') + '\n' + css, encoding='utf-8')
        for f in tok['type']['fonts']:
            for name in (f['file'], f['file'].rsplit('.', 1)[0] + '.woff2'):
                if (P / name).exists():
                    (react / 'styles' / name).write_bytes((P / name).read_bytes())
        if (SRC / 'OFL.txt').exists():
            (react / 'styles' / 'fonts' / 'OFL.txt').write_text((SRC / 'OFL.txt').read_text(encoding='utf-8'), encoding='utf-8')

    # components
    comp_dir = P / 'components'
    found = sorted(d.name for d in comp_dir.iterdir() if d.is_dir())
    used = set()
    for name in found:
        d = comp_dir / name
        prev, readme = d / 'preview.html', d / 'README.md'
        if name == COVER:
            if readme.exists():
                problems.append(f'{COVER} must stay bare: remove its README.md')
        elif not readme.exists():
            problems.append(f'{name}: no README.md')
        if not prev.exists():
            problems.append(f'{name}: no preview.html'); continue
        text = prev.read_text(encoding='utf-8')
        first = text.split('\n', 1)[0]
        if not re.fullmatch(r'<!-- @dsCard( group="[^"]+")? height=\d+( width=\d+)?( [a-z]+="[^"]*")* -->', first):
            problems.append(f'{name}: line 1 is not a @dsCard marker: {first[:70]}')
        for tag in ('iframe', 'frame', 'object', 'embed', 'portal', 'noscript'):
            if re.search(rf'<{tag}[\s>]', text, re.I):
                problems.append(f'{name}: forbidden <{tag}>')
        for url in re.findall(r'(?:src|href)="(https?://[^"]+)"', text):
            problems.append(f'{name}: loads {url}')
        used |= set(re.findall(r'var\(--([A-Za-z0-9_.-]+)', text))
        for ic in re.findall(r'#tray-i-([a-z0-9-]+)', text):
            if ic not in icons:
                problems.append(f'{name}: unknown icon {ic}')
    used |= set(re.findall(r'var\(--([A-Za-z0-9_.-]+)', css))
    used |= page_used

    # the component index: one section of the brand book that lists every component, group by group
    rows = {}
    for name in found:
        d = comp_dir / name
        if name == COVER or not (d / 'README.md').exists() or not (d / 'preview.html').exists():
            continue
        group = re.search(r'group="([^"]+)"', (d / 'preview.html').read_text(encoding='utf-8').split('\n', 1)[0])
        readme = (d / 'README.md').read_text(encoding='utf-8').strip().split('\n')
        summary = next((p for p in '\n'.join(readme[1:]).strip().split('\n\n') if p.strip()), '').replace('\n', ' ').replace('|', '\\|')
        if not group or group.group(1) not in GROUPS:
            problems.append(f'{name}: its group has no place in the component index')
            continue
        rows.setdefault(group.group(1), []).append((readme[0].lstrip('# ').strip(), summary))
    index = ['# Component index', '', f'The {sum(len(v) for v in rows.values())} components of the system, group by group. Read a component\'s guidelines before using it.']
    for g in GROUPS:
        if g in rows:
            index += ['', f'## {g}', '', '| Component | Use |', '| --- | --- |'] + [f'| {t} | {s} |' for t, s in sorted(rows[g])]
    (P / 'guides' / '0-components.md').write_text('\n'.join(index) + '\n', encoding='utf-8')
    for ic in set(re.findall(r'tray-i-([a-z0-9-]+)', js)) | set(re.findall(r"icon\('([a-z0-9-]+)'", js)):
        if ic not in icons and not ic.endswith('-'):  # a name ending in a hyphen is built at run time
            problems.append(f'bundle.js: unknown icon {ic}')
    for v in sorted(used):
        if v not in defined and not v.startswith('tray-'):
            problems.append(f'undefined custom property --{v}')
    missing = [n for n in EXPECTED if n not in found]
    extra = [n for n in found if n not in EXPECTED and n != COVER]

    print(f'tokens {len(names)} | icons {len(icons)} | css {len(css) // 1024} KB from {len(css_parts)} files | '
          f'js {len(js) // 1024} KB from {len(js_parts)} files | components {len([n for n in found if n != COVER])}/{len(EXPECTED)} | '
          f'blocks {len(pages)}')
    if missing:
        print('still to build:', ' '.join(missing))
    if extra:
        print('beyond the list:', ' '.join(extra))
    for p in problems:
        print('PROBLEM', p)
    return not problems


if __name__ == '__main__':
    sys.exit(0 if build() else 1)
