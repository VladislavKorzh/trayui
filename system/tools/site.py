#!/usr/bin/env python3
"""Build site/: the website of the design system.

    python3 tools/site.py

It reads what the design system publishes (project/README.md, tokens.json, guides/*.md, components/<Name>/preview.html and
README.md, blocks/*.html), the icons, and the site's own pages (tools/site/home.html, tools/site/pages/*.md),
and writes one static site: a file for every page, drawn in it, at the page's address (index.html, docs/installation.html,
components/lightbox.html: the host serves it at /components/lightbox), site.css, site.js, data.js (the map of the site), one
pages/<id>.js per page (a doc, a component, a block: moving to a page loads that page alone), data-charts.js,
sitemap.xml, the files of dist/
(so the site is also where the three files can be linked or downloaded from), a zip of dist/ and llms.txt.

The Charts section shows the chart examples of the React package (react/examples/charts). They are drawn live, so the build
bundles them, with React and Recharts, into charts.js: that step runs node, and installs react/ with `npm ci` the first time.
Code is coloured by highlight.js, from the same package: the build colours every code block it writes (react/scripts/code.mjs,
one node process for the whole build), and code.js colours the code the page writes itself, loaded the first time it is needed.

On the web every page has an address of its own; framed inside another page, only a # may reach it, so there
index.html alone shows every page by hash (#c-lightbox). Run tools/build.py first, then python3 tools/serve.py: it serves
site/ at the same addresses as the host.
"""
import gzip, html, json, pathlib, re, shutil, subprocess, sys, zipfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
P, SRC, DIST, OUT = ROOT / 'project', ROOT / 'tools' / 'site', ROOT / 'dist', ROOT / 'site'
REACT, CHARTS = ROOT / 'react', ROOT / 'react' / 'examples' / 'charts'
LINKS = json.loads((ROOT / 'tools' / 'links.json').read_text(encoding='utf-8'))
VERSION = LINKS.get('version', '0.1.0')
from build import BLOCK_GROUPS, GROUPS, dark_themes, read_blocks  # the order of the groups, the blocks, and which themes are dark

BLOCK = 'div|ul|ol|li|section|article|aside|nav|header|main|footer|form|fieldset|table|thead|tbody|tr|dl|dialog|figure|details|p|h1|h2|h3|label|button'
CODE_LABELS = {'html': 'HTML', 'js': 'JavaScript', 'css': 'CSS', 'tsx': 'React', 'jsx': 'React', 'sh': 'Terminal', 'json': 'JSON', 'text': 'Text'}


def slug(name):
    return re.sub(r'(?<=[a-z0-9])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])', '-', name).lower()


# ---------- Addresses: every page has one, from the root of the site ----------
# A page is known inside the build and the scripts by its id (c-lightbox); a visitor knows it by its address
# (/components/lightbox). The section is the first part, the page the second; the first page of a section is the
# section's own address. These are the pages whose address is not their id without its prefix.
ADDRESSES = {'home': '', 'd-introduction': 'docs', 'f-type': 'docs/typography', 'f-scale': 'docs/space-and-shape',
             'g-brand': 'docs/brand-book', 'ch-use': 'charts/usage', 'ch-ready': 'charts/chart-component'}
SECTION_OF = {'d': 'docs', 'f': 'docs', 'g': 'docs', 'c': 'components', 'b': 'blocks', 'ch': 'charts'}


def route(ident):
    """The address of a page with no slash at either end: '' is the home page, 'components/lightbox' a component."""
    if ident in ADDRESSES:
        return ADDRESSES[ident]
    if ident in ('components', 'blocks', 'charts'):
        return ident
    prefix, _, rest = ident.partition('-')
    return f'{SECTION_OF[prefix]}/{rest}'


def addressed(text, known):
    """The sources link a page by its id (href="#c-lightbox"); the site links it by its address (href="/components/lightbox").
    An icon (#tray-i-…) and a link inside an example (#, #orders) name no page, and stay as they are."""
    return re.sub(r'href="#([a-z0-9-]+)"', lambda m: f'href="/{route(m.group(1))}"' if m.group(1) in known else m.group(0), text)


def icon(name, cls=''):
    return f'<svg class="tray-icon{" " + cls if cls else ""}" aria-hidden="true"><use href="#tray-i-{name}"/></svg>'


def inline(text):
    """Inline Markdown: code spans, bold, links to a page of the site (#id) or to the web. Everything else is escaped."""
    out = []
    for i, part in enumerate(text.split('`')):
        if i % 2:
            out.append(f'<code class="tray-code-inline">{html.escape(part, quote=False)}</code>')
        else:
            part = html.escape(part, quote=False)
            part = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', part)
            part = re.sub(r'\[([^\]]+)\]\((#[a-z0-9-]+|https://[^)\s]+|[A-Za-z0-9./-]+\.(?:zip|txt|css|js|cjs|json))\)',
                          lambda m: (f'<a href="{m.group(2)}">' if m.group(2).startswith(('#', 'https:')) else  # a page, or another site
                                     f'<a href="/{m.group(2)}"' + (' download' if re.search(r'\.(zip|css|js|cjs|json)$', m.group(2)) else '') + '>')  # a file of the site
                          + m.group(1) + '</a>', part)
            out.append(part)
    return ''.join(out)


class Colours:
    """Syntax colours while the site is built: highlight.js in one node process (react/scripts/code.mjs --serve), asked one
    block at a time. colour(text, lang) is the code as HTML, escaped, its parts in spans the code block colours."""
    def __init__(self):
        self.proc = None

    def __call__(self, text, lang):
        if lang not in CODE_LABELS or lang == 'text':
            return html.escape(text, quote=False)
        if self.proc is None:
            react_ready()
            self.proc = subprocess.Popen(['node', str(REACT / 'scripts' / 'code.mjs'), '--serve'], cwd=REACT, stdin=subprocess.PIPE,
                                         stdout=subprocess.PIPE, text=True, encoding='utf-8')
        self.proc.stdin.write(json.dumps({'lang': lang, 'text': text}) + '\n')
        self.proc.stdin.flush()
        line = self.proc.stdout.readline()
        if not line:
            sys.exit('the syntax colours stopped: react/scripts/code.mjs --serve ended early')
        return json.loads(line)

    def close(self):
        if self.proc:
            self.proc.stdin.close()
            self.proc.wait()
            self.proc = None


colour = Colours()


def code_block(text, lang, ident):
    return (f'<div class="tray-code" dir="ltr"><div class="tray-code__head"><span>{CODE_LABELS.get(lang, "Text")}</span>'
            f'<button class="tray-btn tray-btn--ghost tray-btn--xs" type="button" data-tray="copy" data-target="#{ident}">{icon("copy", "tray-icon--sm")}<span data-label>Copy</span></button></div>'
            f'<pre tabindex="0"><code id="{ident}">{colour(text, lang)}</code></pre></div>')


def markdown(text, prefix):
    """The Markdown the guidelines and the site's pages use: h2, h3, paragraphs, bullet and numbered lists, pipe tables, fenced code."""
    out, lines, i, n = [], text.strip('\n').split('\n'), 0, 0
    while i < len(lines):
        line = lines[i]
        if not line.strip():
            i += 1
        elif line.startswith('```'):
            lang, body = line[3:].strip(), []
            i += 1
            while i < len(lines) and not lines[i].startswith('```'):
                body.append(lines[i]); i += 1
            i += 1; n += 1
            out.append(code_block('\n'.join(body), lang, f'{prefix}-code-{n}'))
        elif line.startswith('### '):
            out.append(f'<h3 class="site-h3">{inline(line[4:])}</h3>'); i += 1
        elif line.startswith('## '):
            out.append(f'<h2 class="subtitle">{inline(line[3:])}</h2>'); i += 1
        elif line.startswith('# '):
            out.append(f'<h2 class="subtitle">{inline(line[2:])}</h2>'); i += 1
        elif line.startswith('|'):
            rows = []
            while i < len(lines) and lines[i].startswith('|'):
                rows.append([c.strip() for c in re.split(r'(?<!\\)\|', lines[i].strip().strip('|'))]); i += 1
            head, body = rows[0], rows[2:]
            out.append('<div class="tray-table-wrap"><table class="tray-table"><thead><tr>' + ''.join(f'<th scope="col">{inline(c)}</th>' for c in head) + '</tr></thead><tbody>'
                       + ''.join('<tr>' + ''.join(f'<td>{inline(c)}</td>' for c in r) + '</tr>' for r in body) + '</tbody></table></div>')
        elif re.match(r'(- |\d+\. )', line):
            tag = 'ul' if line.startswith('- ') else 'ol'
            items = []
            while i < len(lines) and re.match(r'(- |\d+\. )', lines[i]):
                items.append(re.sub(r'^(- |\d+\. )', '', lines[i])); i += 1
            out.append(f'<{tag} class="tray-list-plain">' + ''.join(f'<li>{inline(x)}</li>' for x in items) + f'</{tag}>')
        else:
            para = []
            while i < len(lines) and lines[i].strip() and not re.match(r'(```|### |## |# |\||- |\d+\. )', lines[i]):
                para.append(lines[i]); i += 1
            out.append(f'<p>{inline(" ".join(para))}</p>')
    return '\n'.join(out)


def pretty(markup):
    """Put each block-level element of a preview on its own line and indent by nesting, so the markup can be read."""
    is_open = lambda t: re.match(rf'<(?:{BLOCK})\b', t)
    is_close = lambda t: re.match(rf'</(?:{BLOCK})>', t)
    tokens = [t for t in re.split(rf'(<(?:{BLOCK})\b[^>]*>|</(?:{BLOCK})>)', re.sub(r'\n+', '', markup.strip())) if t.strip()]
    out, depth, i = [], 0, 0
    while i < len(tokens):
        t = tokens[i]
        if is_open(t):
            if i + 2 < len(tokens) and not is_open(tokens[i + 1]) and not is_close(tokens[i + 1]) and is_close(tokens[i + 2]):
                out.append('  ' * depth + t + tokens[i + 1].strip() + tokens[i + 2]); i += 3; continue  # an element that holds only text and inline tags
            if i + 1 < len(tokens) and is_close(tokens[i + 1]):
                out.append('  ' * depth + t + tokens[i + 1]); i += 2; continue
            out.append('  ' * depth + t); depth += 1
        elif is_close(t):
            depth = max(0, depth - 1); out.append('  ' * depth + t)
        else:
            out.append('  ' * depth + t.strip())
        i += 1
    return '\n'.join(out)


def read_component(d):
    text = (d / 'preview.html').read_text(encoding='utf-8')
    marker = text.split('\n', 1)[0]
    group = re.search(r'group="([^"]+)"', marker).group(1)
    height = int(re.search(r'height=(\d+)', marker).group(1))
    body = re.search(r'<body>\n?(.*)</body>', text, re.S).group(1)
    body = body.replace('../../assets/', '/assets/')  # a preview's pictures and films: the site carries assets/ at its root
    scripts = re.findall(r'<script>(.*?)</script>', body, re.S)
    body = re.sub(r'<script>.*?</script>\n?', '', body, flags=re.S).strip()
    readme = (d / 'README.md').read_text(encoding='utf-8').strip()
    title = readme.split('\n', 1)[0].lstrip('# ').strip()
    rest = readme.split('\n', 1)[1].strip()
    summary, _, guide = rest.partition('\n\n')
    return {'name': d.name, 'id': 'c-' + slug(d.name), 'title': title, 'group': group, 'height': height, 'body': body,
            'script': '\n'.join(s.strip() for s in scripts), 'summary': summary.replace('\n', ' '), 'guide': guide}


def read_page(f, ident, group):
    """A page of the site written in Markdown: a title, one paragraph of summary, then the body."""
    text = f.read_text(encoding='utf-8').strip()
    title = text.split('\n', 1)[0].lstrip('# ').strip()
    rest = text.split('\n', 1)[1].strip()
    summary, _, body = rest.partition('\n\n')
    return {'id': ident, 'title': title, 'summary': summary.replace('\n', ' '), 'guide': body, 'group': group}


def head(title, summary):
    return ('<div class="tray-pagehead"><div class="tray-pagehead__row"><div class="tray-pagehead__text">'
            f'<h1 class="title" tabindex="-1">{html.escape(title)}</h1><p>{inline(summary)}</p></div></div></div>')


def pager(prev, nxt):
    def link(p, way):
        if not p:
            return '<span></span>'
        arrow = icon('arrow-left' if way == 'prev' else 'arrow-right', 'tray-icon--flip')
        label = f'<span class="tray-item__body"><span class="tray-item__text">{"Before" if way == "prev" else "Next"}</span><span class="tray-item__title">{html.escape(p["title"])}</span></span>'
        return f'<a class="tray-item site-pager__{way}" href="#{p["id"]}">' + (arrow + label if way == 'prev' else label + arrow) + '</a>'
    return f'<nav class="site-pager" aria-label="Other pages">{link(prev, "prev")}{link(nxt, "next")}</nav>'


def sizes_control(name):
    return ''.join(f'<label class="tray-seg__item"><input type="radio" name="{name}" value="{v}"{" checked" if v == "desktop" else ""}><span>{t}</span></label>'
                   for v, t in (('desktop', 'Desktop'), ('tablet', 'Tablet'), ('phone', 'Phone')))


def viewer(p):
    """The page of one block: the live frame at a chosen width, and its code."""
    uses = ' '.join(f'<code class="tray-code-inline">{b}</code>' for b in p['behaviours'])
    note = ('<p>Copy the page, or the part of it you need, into a project that links <code class="tray-code-inline">tokens.css</code>, '
            '<code class="tray-code-inline">components/bundle.css</code> and <code class="tray-code-inline">components/bundle.js</code>; the paths in its '
            '<code class="tray-code-inline">&lt;head&gt;</code> assume the page sits one folder below them, as it does in the <a href="#d-installation">download</a>. '
            + ('The grey trays stand in for your content. ' if p['slots'] else '')
            + (f'Behaviours it uses: {uses}.' if uses else 'It needs no behaviour of its own.') + '</p>')
    return (f'<section class="site-viewer" data-tray="tabs" data-viewer="{p["id"]}" aria-label="Example">'
            '<div class="site-viewer__bar"><div class="tray-tabs" role="tablist" aria-label="Example">'
            '<button class="tray-tab" role="tab" aria-selected="true" aria-controls="site-live" id="site-t1" type="button">Preview</button>'
            '<button class="tray-tab" role="tab" aria-controls="site-src" id="site-t2" type="button">Code</button></div>'
            f'<div class="site-viewer__tools"><div class="tray-seg tray-seg--sm site-viewer__sizes" role="radiogroup" aria-label="Width of the preview">{sizes_control("site-size")}</div>'
            '<button class="tray-btn tray-btn--quiet tray-btn--sm" type="button" data-full>Full size</button>'
            f'<button class="tray-btn tray-btn--quiet tray-btn--sm" type="button" data-tray="copy" data-target="#site-src-code">{icon("copy")}<span data-label>Copy the code</span></button></div></div>'
            f'<div class="tray-tabpanel" role="tabpanel" id="site-live" aria-labelledby="site-t1"><div class="site-frame" data-frame="{p["id"]}"></div></div>'
            '<div class="tray-tabpanel" role="tabpanel" id="site-src" aria-labelledby="site-t2" tabindex="0" hidden>'
            '<div class="tray-code" dir="ltr"><div class="tray-code__head"><span>HTML</span></div><pre tabindex="0"><code id="site-src-code"></code></pre></div></div></section>'
            f'<article class="site-prose">{note}</article>')


def gallery(title, summary, groups, lead):
    """The first page of the Blocks section: every block as a small live picture, group by group."""
    out = head(title, summary) + f'<section class="site-prose">{lead}</section>'
    for g, items in groups:
        cards = ''.join(f'<a class="site-thumb" href="#{x["id"]}"><span class="site-thumb__view" data-thumb="{x["id"]}"></span>'
                        f'<span class="site-thumb__text"><b>{html.escape(x["title"])}</b><small>{html.escape(x["summary"])}</small></span></a>' for x in items)
        out += f'<section class="site-prose"><h2 class="subtitle">{html.escape(g)}</h2><div class="site-gallery">{cards}</div></section>'
    return out


# ---------- Themes: the ones that come with the system, and a place to make another ----------

def theme_data(tok):
    """Every theme with a value for every colour token, the names of the tokens that differ between themes, and the corners."""
    first, dark = tok['color']['themes'][0]['id'], set(dark_themes(tok))
    pick = lambda t, th: t['value'] if isinstance(t['value'], str) else t['value'].get(th, t['value'][first])
    themes = [{'id': th['id'], 'name': th['name'], 'mode': 'dark' if th['id'] in dark else 'light',
               'tokens': {t['name']: pick(t, th['id']) for t in tok['color']['tokens']},
               'more': {t['name']: pick(t, th['id']) for t in tok['shadow']['tokens']}} for th in tok['color']['themes']]
    return {'list': themes, 'themed': [t['name'] for t in tok['color']['tokens'] if isinstance(t['value'], dict)],
            'radii': {t['name']: t['value'] for t in tok['radius']['tokens']},
            'usage': {t['name']: t.get('usage', '').split('. ')[0].rstrip('.').replace('`', '') for t in tok['color']['tokens']}}


# The mark of the system: the tile takes the accent of the theme, the bar stays ink. site.css sets it down and lets it move.
MARK = ('<svg class="site-mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><rect class="site-mark__tile" width="32" height="32" rx="10"/>'
        '<rect class="site-mark__bar" x="8" y="14" width="16" height="10" rx="4"/></svg>')


def theme_dot(ident):
    """A theme in one mark: its accent, ringed in its ink, on its page."""
    return f'<span class="site-dot" data-theme="{ident}" aria-hidden="true"></span>'


def theme_menu(themes):
    """The options of the theme menu in the header: the light themes, then the dark ones, then the way to the maker."""
    def option(th):
        return (f'<button type="button" class="tray-option" role="menuitemradio" data-group="theme" data-value="{th["id"]}" aria-checked="false">{theme_dot(th["id"])}'
                f'<span class="tray-option__text">{html.escape(th["name"])}</span>{icon("check", "tray-option__check")}</button>')
    out = ''
    for mode, title in (('light', 'Light themes'), ('dark', 'Dark themes')):
        out += f'<div class="tray-list__label">{title}</div>' + ''.join(option(th) for th in themes if th['mode'] == mode)
    return out + '<div data-custom-theme></div><hr class="tray-list__rule"><a class="tray-option" role="menuitem" href="#d-themes">' + icon('sparkle') + '<span class="tray-option__text">Make your own</span></a>'


SAMPLER = '''<div class="site-sampler">
<div class="tray-row tray-row--between"><b class="subtitle" data-maker-name>My theme</b><span class="tray-badge tray-badge--accent">In season</span></div>
<div class="tray-row"><button class="tray-btn tray-btn--md" type="button">Order a jar</button><button class="tray-btn tray-btn--quiet tray-btn--md" type="button">Details</button><button class="tray-btn tray-btn--dark tray-btn--md" type="button">Pack</button></div>
<div class="tray-card site-sampler__card"><div class="tray-stack tray-stack--sm"><p class="nav">Caviar collected</p><p class="tray-soft">Secondary text on a tray, and <span class="tray-muted">a caption</span>.</p>
<div class="tray-field"><label class="tray-label" for="maker-sample">Delivery address</label><input class="tray-input" id="maker-sample" placeholder="Street and house"></div>
<label class="tray-switch"><input type="checkbox" role="switch" checked><span class="tray-switch__track"></span><span>Gift box</span></label>
<label class="tray-check"><input type="checkbox" checked><span class="tray-check__box"><svg viewBox="0 0 20 20" aria-hidden="true"><path class="tray-check__tick" d="M4 10.5l4 4 8-9"/><path class="tray-check__dash" d="M5 10h10"/></svg></span><span>Leave at the door</span></label>
<div class="tray-progress"><span class="tray-progress__name">Autumn batch</span><span class="tray-progress__value">68%</span><span class="tray-progress__bar" role="meter" aria-label="Autumn batch reserved" aria-valuemin="0" aria-valuemax="100" aria-valuenow="68" style="--tray-v: 68"></span></div>
<div class="tray-row tray-row--sm"><span class="tray-badge tray-badge--success">ICON_OK Paid</span><span class="tray-badge tray-badge--danger">ICON_BAD Failed</span><span class="tray-badge">Draft</span><span class="tray-chip">30 g</span></div></div></div>
<div class="site-sampler__pair"><div class="tray-stat tray-inverse"><p class="tray-stat__label">Returning customers</p><p class="tray-stat__value">61%</p></div><div class="tray-stat tray-island"><p class="tray-stat__label">Jars left</p><p class="tray-stat__value">132</p></div></div>
<div class="tray-alert" role="status"><span class="tray-alert__icon">ICON_INFO</span><div class="tray-alert__body"><p class="tray-alert__title">The farm shop is closed on Mondays</p><p class="tray-alert__text">Pickup orders are ready from Tuesday at ten.</p></div></div>
<figure class="tray-chart" data-tray="chart" data-chart='{"type":"bar","stacked":true,"height":120,"table":false,"labels":["Q1","Q2","Q3","Q4"],"series":[{"name":"Jars","values":[6,30,17,9]},{"name":"Restaurants","values":[4,14,8,5]},{"name":"Farm shop","values":[3,8,4,3]},{"name":"Reserve","values":[2,3,2,2]}],"summary":"Stacked bar chart of a harvest by channel, in the colours of this theme. Demo data."}'></figure>
</div>'''


def themes_page(data):
    """The Themes page: every theme as a card to choose, then the maker: a few colours in, a whole theme out."""
    themes = data['list']
    def card(th):
        mini = ('<span class="site-mini"><span class="site-mini__text"><b>Aa</b><i></i><i></i></span><span class="site-mini__tray"><i></i><i></i></span>'
                '<span class="site-mini__row"><span class="site-mini__accent"></span><span class="site-mini__ink"></span></span></span>')
        return (f'<label class="site-themecard"><input class="tray-vh" type="radio" name="site-theme-pick" value="{th["id"]}">'
                f'<span class="site-themecard__frame"><span class="site-themecard__view" data-theme="{th["id"]}">{mini}</span></span>'
                f'<span class="site-themecard__text"><b>{html.escape(th["name"])}</b><small>{"Dark" if th["mode"] == "dark" else "Light"}</small></span></label>')
    def colour(key, label, hint):
        return (f'<div class="tray-field site-colour"><label class="tray-label" for="maker-{key}-hex">{label}</label>'
                f'<div class="site-colour__row"><input type="color" id="maker-{key}" data-seed="{key}" aria-label="{label}: pick a colour">'
                f'<input class="tray-input" id="maker-{key}-hex" data-seed-hex="{key}" inputmode="text" autocomplete="off" spellcheck="false" maxlength="7" aria-describedby="maker-{key}-hint"></div>'
                f'<p class="tray-field__hint" id="maker-{key}-hint">{hint}</p></div>')
    options = ''.join(f'<option value="{th["id"]}">{html.escape(th["name"])}</option>' for th in themes)
    sample = SAMPLER.replace('ICON_OK', icon('circle-check', 'tray-icon--sm')).replace('ICON_BAD', icon('circle-alert', 'tray-icon--sm')).replace('ICON_INFO', icon('info'))
    maker = (
        '<form class="tray-card site-maker__controls" data-maker novalidate><div class="tray-stack">'
        '<div class="tray-field"><label class="tray-label" for="maker-base">Start from</label><span class="tray-select"><select id="maker-base" data-maker-base>' + options + '</select></span></div>'
        '<div class="tray-field"><label class="tray-label" for="maker-name">Name</label><input class="tray-input" id="maker-name" data-maker-name-input value="My theme" maxlength="32" autocomplete="off"></div>'
        + colour('page', 'Page', 'The ground. A pale page makes a light theme, a dark page a dark one.')
        + colour('surface', 'Tray', 'Cards and the fill of controls. It follows the page until you set it.')
        + colour('ink', 'Ink', 'Text. It needs 10:1 on the page and the tray.')
        + colour('accent', 'Accent', 'The one loud colour. Ink text goes on it, so keep it bright.')
        + '<div class="tray-slider-field"><div class="tray-slider-field__head"><label class="tray-label tray-label--inline" for="maker-round">Corners</label><output for="maker-round"></output></div>'
          '<input class="tray-slider" id="maker-round" type="range" min="0" max="150" step="10" value="100" data-unit="%" data-tray="slider" data-maker-round>'
          '<div class="tray-slider-field__scale"><span>Square</span><span>As the system</span><span>Rounder</span></div></div>'
        '<details class="tray-collapsible"><summary><span>Every colour</span><span class="tray-tile" aria-hidden="true">' + icon('plus') + '</span></summary>'
        '<div class="tray-collapsible__body"><p class="tray-field__hint">The steps between the page and the ink are worked out for you. Set one here to keep it as it is.</p><div class="site-tokens-edit" data-maker-tokens></div></div></details>'
        '<div class="tray-row"><button class="tray-btn tray-btn--md" type="button" data-maker-use><span>Use on this site</span></button>'
        '<button class="tray-btn tray-btn--quiet tray-btn--md" type="button" data-maker-link>' + icon('link') + 'Copy a link</button>'
        '<button class="tray-btn tray-btn--quiet tray-btn--md" type="button" data-maker-random>' + icon('sparkle') + 'Surprise me</button>'
        '<button class="tray-btn tray-btn--ghost tray-btn--md" type="button" data-maker-reset>Start again</button>'
        '<button class="tray-btn tray-btn--ghost tray-btn--md" type="button" data-maker-forget hidden>Take it off this site</button></div>'
        '</div></form>')
    return (
        '<article class="site-prose" data-themes>'
        f'<p>A theme gives every colour token a value. {len(themes)} come with the system: choose one and this whole site wears it, charts and all. '
        'Then tune it below, or start from a colour of your own.</p>'
        f'<h2 class="subtitle" id="themes-list">The {len(themes)} themes</h2>'
        f'<div class="site-themelist" role="radiogroup" aria-labelledby="themes-list">{"".join(card(th) for th in themes)}</div>'
        '<p>On a page of your own, name the theme on <code class="tray-code-inline">&lt;html&gt;</code>, or on any element to theme only what is inside it:</p>'
        + code_block('<html lang="en" data-theme="mint">', 'html', 'd-themes-code-1')
        + '<h2 class="subtitle" id="themes-make">Make your own</h2>'
        '<p>Choose four colours. The other tokens are steps between the page and the ink, each at the contrast the system was tuned to, so the theme is checked as you make it.</p>'
        '<div data-maker-shared></div>'
        f'<div class="site-maker">{maker}<div class="site-maker__stage"><div class="site-maker__preview" data-maker-preview data-theme="site-draft" role="group" aria-label="The theme on real components">{sample}</div></div></div>'
        '<h2 class="subtitle" id="themes-check">Does it hold?</h2>'
        '<div data-maker-verdict></div><details class="tray-collapsible"><summary><span>Show every rule</span><span class="tray-tile" aria-hidden="true">' + icon('plus') + '</span></summary>'
        '<div class="tray-collapsible__body"><div class="tray-table-wrap"><table class="tray-table tray-table--compact"><thead><tr><th scope="col">What</th><th scope="col">Tokens</th>'
        '<th scope="col" data-num>Contrast</th><th scope="col" data-num>Needs</th><th scope="col">Holds</th></tr></thead><tbody data-maker-report></tbody></table></div></div></details>'
        '<h2 class="subtitle" id="themes-css">Take it with you</h2>'
        '<p>The theme is one rule. Save it as a stylesheet and link it after the system, or paste it into a stylesheet of your own, then name it on <code class="tray-code-inline">&lt;html&gt;</code>.</p>'
        '<div class="tray-code" dir="ltr"><div class="tray-code__head"><span>CSS</span><button class="tray-btn tray-btn--ghost tray-btn--xs" type="button" data-tray="copy" data-target="#site-theme-css">'
        + icon('copy', 'tray-icon--sm') + '<span data-label>Copy</span></button></div><pre tabindex="0"><code id="site-theme-css"></code></pre></div>'
        + code_block('<link rel="stylesheet" href="tokens.css">\n<link rel="stylesheet" href="components/bundle.css">\n<link rel="stylesheet" href="my-theme.css">', 'html', 'd-themes-code-2')
        + '<div class="tray-code" dir="ltr"><div class="tray-code__head"><span>HTML</span></div><pre tabindex="0"><code id="site-theme-html"></code></pre></div>'
        '<p>Or send it as a link. Whoever opens it finds the theme here in the maker, checked the same way, and can wear it on this site with one press.</p>'
        '<div class="tray-code" dir="ltr"><div class="tray-code__head"><span>Link</span><button class="tray-btn tray-btn--ghost tray-btn--xs" type="button" data-tray="copy" data-target="#site-theme-link">'
        + icon('copy', 'tray-icon--sm') + '<span data-label>Copy</span></button></div><pre tabindex="0"><code id="site-theme-link"></code></pre></div>'
        '<p>The link holds the colours themselves. The theme lives in this browser and in the links you copy: nothing is sent anywhere.</p></article>')


# ---------- Playgrounds: a component with controls for its variant, size and state ----------

PLAY_TYPES = {'choice', 'switch', 'text', 'range'}


def read_plays(names):
    """tools/site/play/<Name>.json for the components that have one; tools/site/playground.js says what a file holds."""
    plays, problems = {}, []
    for f in sorted((SRC / 'play').glob('*.json')):
        try:
            spec = json.loads(f.read_text(encoding='utf-8'))
        except ValueError as e:
            problems.append(f'play/{f.name}: not JSON ({e})'); continue
        if f.stem not in names:
            problems.append(f'play/{f.name}: no component is called {f.stem}'); continue
        controls, template = spec.get('controls') or [], spec.get('template') or ''
        seen = [c.get('name') for c in controls]
        for c in controls:
            kind = c.get('type', 'choice')
            if kind not in PLAY_TYPES or not c.get('name') or not c.get('label'):
                problems.append(f'play/{f.name}: a control needs a name, a label and a type of {sorted(PLAY_TYPES)}: {c}')
            if kind == 'choice' and (not c.get('options') or ('default' in c and str(c['default']) not in [str(o[0]) for o in c['options']])):
                problems.append(f'play/{f.name}: {c.get("name")}: options missing, or a default that is not one of them')
        for name in set(re.findall(r'\{\{[#^/]?([a-z][\w-]*)', template)) - {'icon'}:
            if name not in seen:
                problems.append(f'play/{f.name}: the template uses {{{{{name}}}}}, which no control sets')
        if 'grounds' in spec and spec['grounds'] is not False and not (isinstance(spec['grounds'], list) and set(spec['grounds']) <= {'page', 'tray', 'ink', 'accent'} and 'page' in spec['grounds']):
            problems.append(f'play/{f.name}: grounds is false, or a list of page, tray, ink and accent that holds page')
        if len(seen) != len(set(seen)) or not template:
            problems.append(f'play/{f.name}: a control name used twice, or no template')
        plays[f.stem] = spec
    return plays, problems


def play_section(c, spec):
    """The playground under the example: the stage, the controls beside it, the markup under both."""
    ident, width = c['id'], spec.get('width')
    lead = spec.get('lead') or f'Choose how the {c["title"].lower()} looks and behaves, and copy its markup.'
    return (f'<section class="site-play" data-play="{ident}" aria-labelledby="{ident}-play"{f" style=\"--play-w: {width}\"" if width else ""}>'
            f'<div class="site-play__head"><h2 class="subtitle" id="{ident}-play">Playground</h2><p>{inline(lead)}</p></div>'
            '<div class="site-play__box"><div class="site-play__stage" data-play-stage role="group" aria-label="The example, as chosen"></div>'
            '<form class="tray-card site-play__controls" data-play-controls aria-label="Choices" novalidate></form></div>'
            f'<div class="tray-code" dir="ltr"><div class="tray-code__head"><span>HTML</span><button class="tray-btn tray-btn--ghost tray-btn--xs" type="button" data-tray="copy" data-target="#{ident}-play-code">'
            f'{icon("copy", "tray-icon--sm")}<span data-label>Copy</span></button></div><pre tabindex="0"><code id="{ident}-play-code" data-play-code></code></pre></div></section>')


# ---------- Charts: the examples of the React package ----------

def read_charts():
    """The groups and their order come from charts.json; the code of each example is its file."""
    groups = json.loads((CHARTS / 'charts.json').read_text(encoding='utf-8'))['groups']
    files = {f.stem: f.read_text(encoding='utf-8').strip() + '\n' for f in CHARTS.glob('*.tsx')}
    listed = [c['id'] for g in groups for c in g['charts']]
    if set(listed) != set(files) or len(listed) != len(set(listed)):
        sys.exit(f'react/examples/charts: the files and charts.json disagree about {sorted(set(listed) ^ set(files)) or "an id listed twice"}')
    for g in groups:
        for c in g['charts']:
            c['source'], c['group'] = files[c['id']], g['title']
    return groups


def chart_card(c, group, level='h2'):
    name = f'{group["nav"]}: {c["title"]}' if group['id'] != 'ready' else f'Chart: {c["title"]}'
    return (f'<article class="site-chart{" site-chart--wide" if c.get("wide") else ""}"><div class="site-chart__bar"><div><{level} class="site-chart__name">{html.escape(c["title"])}</{level}>'
            f'<p>{html.escape(c["note"])}</p></div><button class="tray-btn tray-btn--quiet tray-btn--xs" type="button" data-chart-code="{c["id"]}" data-title="{html.escape(name)}" '
            f'aria-haspopup="dialog" aria-label="Code of {html.escape(name)}">{icon("code", "tray-icon--sm")}Code</button></div>'
            f'<div class="site-chart__view" data-rechart="{c["id"]}"></div></article>')


def react_ready():
    """The React package, installed: the chart examples and the syntax colours are built with it."""
    if not all((REACT / 'node_modules' / name).exists() for name in ('recharts', 'highlight.js', 'esbuild')):
        print('site: installing the React package for the charts and the syntax colours (npm ci in react/)')
        try:
            installed = subprocess.run(['npm', 'ci', '--no-audit', '--no-fund'], cwd=REACT, capture_output=True, text=True)
        except FileNotFoundError:
            sys.exit('the charts and the syntax colours are built with node and npm, which were not found: install Node 18 or later and build again')
        if installed.returncode:
            sys.exit('npm ci failed in react/:\n' + installed.stdout[-2000:] + installed.stderr[-2000:])


def bundle_charts(out):
    """React, Recharts, the chart kit and every example as one script, written by the React package's own bundler."""
    react_ready()
    done = subprocess.run(['node', str(REACT / 'scripts' / 'charts.mjs'), str(out)], capture_output=True, text=True)
    if done.returncode:
        sys.exit('the chart examples did not bundle:\n' + done.stdout + done.stderr)
    return done.stdout.strip()


def bundle_code(out):
    """code.js: highlight.js with the grammars of the code the page writes itself (HTML and CSS), and its licence beside it."""
    react_ready()
    done = subprocess.run(['node', str(REACT / 'scripts' / 'code.mjs'), '--bundle', str(out)], capture_output=True, text=True)
    if done.returncode:
        sys.exit('the syntax colours did not bundle:\n' + done.stdout + done.stderr)
    return done.stdout.strip()


# ---------- Foundations: pages drawn from tokens.json and the icons ----------

def css_value(v):
    return re.sub(r'^\{([^}]+)\}$', r'var(--\1)', v)


def colours_page(tok):
    themes = tok['color']['themes'][:2]  # Light and Dark, the two tuned by hand; the Themes page shows the others
    rows = ''
    for t in tok['color']['tokens']:
        vals = t['value'] if isinstance(t['value'], dict) else {themes[0]['id']: t['value']}
        chips = ''.join(f'<span class="site-swatch" data-theme="{th["id"]}" style="background: var(--{t["name"]})" role="img" aria-label="{t["name"]} in the {th["name"].lower()} theme"></span>' for th in themes)
        values = '<br>'.join(f'<span class="tray-num">{html.escape(css_value(vals.get(th["id"], vals[themes[0]["id"]])))}</span>' for th in themes)
        rows += (f'<tr><td><span class="site-swatches">{chips}</span></td><th scope="row"><code class="tray-code-inline">--{t["name"]}</code></th>'
                 f'<td class="site-values">{values}</td><td>{inline(t.get("usage", ""))}</td></tr>')
    heads = ' / '.join(th['name'] for th in themes)
    return ('<article class="site-prose"><p>Every colour is a custom property declared by <code class="tray-code-inline">tokens.css</code>. A neutral system with one loud colour: '
            'the page, the tray, ink in four steps, and one accent for the thing to do. The dark theme has its own steps, chosen against the dark page. '
            f'The table shows Light and Dark; the other {len(tok["color"]["themes"]) - 2} themes give the same tokens other values: see <a href="#d-themes">Themes</a>.</p>'
            f'<div class="tray-table-wrap"><table class="tray-table site-tokens"><thead><tr><th scope="col">{heads}</th><th scope="col">Token</th><th scope="col">Values</th><th scope="col">Use</th></tr></thead>'
            f'<tbody>{rows}</tbody></table></div></article>')


def type_page(tok):
    out = ('<article class="site-prose"><p>One family, Onest, in two voices: weight 700 with tight tracking for anything that names, weight 400 with open leading for anything that explains. '
           'Each style is a class of the same name. The five heading styles are fluid: the size shown is their largest.</p>')
    samples = {'display': 'Our snails grow in the open air', 'headline': 'How to tell it', 'title': 'Order a jar', 'subtitle': 'Delivery in a chilled box', 'figure': '22',
               'lead': 'White caviar from our own farm, collected by hand from March to October.', 'body': 'The courier calls ten minutes before arriving. Keep the jar cold and open it within three days.',
               'caption': 'Updated on 12 November', 'tick': '25 kg', 'action': 'Order a jar', 'control': '50 g', 'nav': 'Field notes', 'label': 'Delivery address',
               'code': 'data-tray="tabs"', 'kbd': 'Ctrl'}
    for g in tok['type']['groups']:
        rows = ''
        for s in g['styles']:
            meta = f'{s["fontSize"]} / {s["lineHeight"]} / {s["fontWeight"]}' + (f' / {s["letterSpacing"]}' if 'letterSpacing' in s else '')
            rows += (f'<div class="site-type"><div class="site-type__meta"><code class="tray-code-inline">.{s["name"]}</code><span class="tray-num">{html.escape(meta)}</span></div>'
                     f'<p class="{s["name"]} site-type__sample">{html.escape(samples.get(s["name"], "Tray UI"))}</p></div>')
        out += f'<h2 class="subtitle">{html.escape(g["name"])}</h2><div class="site-types">{rows}</div>'
    fam = ''.join(f'<tr><th scope="row"><code class="tray-code-inline">--font-{k}</code></th><td>{html.escape(v)}</td></tr>' for k, v in tok['type']['families'].items())
    out += ('<h2 class="subtitle">Families</h2><div class="tray-table-wrap"><table class="tray-table"><thead><tr><th scope="col">Token</th><th scope="col">Stack</th></tr></thead>'
            f'<tbody>{fam}</tbody></table></div><p>Onest is a variable font (weights 100 to 900) under the SIL Open Font License; its file and licence come with the download.</p></article>')
    return out


def scale_page(tok):
    def table(key, title, lead, draw):
        rows = ''.join(f'<tr><td class="site-scale">{draw(t)}</td><th scope="row"><code class="tray-code-inline">--{t["name"]}</code></th>'
                       f'<td class="tray-num">{html.escape(str(t["value"] if isinstance(t["value"], str) else list(t["value"].values())[0]))}</td><td>{inline(t.get("usage", ""))}</td></tr>' for t in tok[key]['tokens'])
        return (f'<h2 class="subtitle">{title}</h2><p>{lead}</p><div class="tray-table-wrap"><table class="tray-table site-tokens"><thead><tr><th scope="col"><span class="tray-vh">Picture</span></th>'
                f'<th scope="col">Token</th><th scope="col">Value</th><th scope="col">Use</th></tr></thead><tbody>{rows}</tbody></table></div>')
    plain = lambda t: ''
    out = '<article class="site-prose">'
    out += table('spacing', 'Space', 'Space inside components comes from these steps; the gap between a tray and what it holds is the smallest one.',
                 lambda t: f'<span class="site-bar" style="inline-size: var(--{t["name"]})"></span>')
    out += table('radius', 'Corners', 'Corners are very round and step down with nesting. Nothing has a hard corner.',
                 lambda t: f'<span class="site-corner" style="border-start-start-radius: min(var(--{t["name"]}), 40px)"></span>')
    out += table('size', 'Sizes', 'The heights of controls. Nothing a finger must hit is smaller than the hit size.',
                 lambda t: f'<span class="site-bar site-bar--tall" style="block-size: calc(var(--{t["name"]}) / 2)"></span>')
    out += table('layout', 'Layout', 'One centred container, a 12-column bento on a 16px gap, and the measure of a column of text.', plain)
    out += table('shadow', 'Shadow', 'The only shadow, for things that float above the page: a menu, a dialog, a toast.',
                 lambda t: f'<span class="site-float" style="box-shadow: var(--{t["name"]})"></span>')
    for key, title, lead in (('fluid', 'Fluid type sizes', 'The five heading styles take their size from these.'), ('timing', 'Motion', 'Short eased changes of fill, a press, a knob that travels. Nothing moves on its own.'),
                             ('zIndex', 'Layers', 'Four layers, in this order.'), ('breakpoint', 'Breakpoints', 'The widths at which layouts change. Media queries cannot read custom properties, so the stylesheet repeats these values.'),
                             ('opacity', 'Opacity', 'One step, for what is disabled.')):
        if key in tok:
            out += table(key, title, lead, plain)
    return out + '</article>'


def icons_page(icons):
    cells = ''.join(f'<button class="site-icon" type="button" data-icon="{n}">{icon(n)}<span>{n}</span></button>' for n in sorted(icons))
    use = '<svg class="tray-icon" aria-hidden="true"><use href="#tray-i-truck"/></svg>'
    return ('<article class="site-prose"><p>The icons are <a href="https://lucide.dev">Lucide</a>\'s, shown at 20px with a 2px round stroke, in the colour of the text beside them. '
            f'These {len(icons)} are built in, under Lucide\'s own names: the script adds them to the page as a sprite. Choose one to copy its markup.</p>'
            + code_block(use, 'html', 'f-icons-code-1')
            + '<div class="tray-input-group site-icons__find"><span class="tray-input-group__addon">' + icon('search') + '</span>'
              f'<input class="tray-input" type="search" placeholder="Find among {len(icons)} icons" aria-label="Find an icon" autocomplete="off" spellcheck="false" data-icon-filter></div>'
              '<p class="tray-list__empty" role="status" hidden data-icon-empty>No icon has that name.</p>'
            + f'<div class="site-icons" data-icons>{cells}</div>'
              '<p>An icon never replaces a label except in an icon button, which then carries an <code class="tray-code-inline">aria-label</code>. '
              '<code class="tray-code-inline">tray-icon--sm</code> is 16px, <code class="tray-code-inline">tray-icon--lg</code> 28px; icons that point along the reading direction take '
              '<code class="tray-code-inline">tray-icon--flip</code>. The same drawings come as single SVG files in the Icons asset group of the design system.</p>'
              '<h2 class="subtitle">Any other Lucide icon</h2>'
              '<p>Lucide has more than 1,500 icons, and any of them fits beside these. In plain HTML, copy the icon from <a href="https://lucide.dev/icons">lucide.dev</a> '
              'and give it the class: it sets the size, the stroke and the colour.</p>'
            + code_block('<svg class="tray-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22V8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/><circle cx="12" cy="5" r="3"/></svg>', 'html', 'f-icons-code-2')
            + '<p>In React, import it from <code class="tray-code-inline">react-icons/lu</code> and pass it wherever a component takes an icon. '
              'A built-in icon goes by its name; the two are drawn alike.</p>'
            + code_block("import { LuRocket } from 'react-icons/lu';\nimport { Button, Icon } from 'trayui-react';\n\n<Button icon=\"truck\">Track the order</Button>      {/* built in: by name */}\n"
                         "<Button icon={<LuRocket />}>Launch</Button>       {/* any other: an element */}\n<Icon name={<LuRocket />} size=\"lg\" />", 'tsx', 'f-icons-code-3')
            + '<p>Lucide is under the ISC licence; some of its icons come from Feather, under the MIT licence. The licence travels with the download, beside the script.</p></article>')


def build():
    tok = json.loads((P / 'tokens.json').read_text(encoding='utf-8'))
    icons = json.loads((ROOT / 'src' / 'icons.json').read_text(encoding='utf-8'))
    comps = [read_component(d) for d in sorted((P / 'components').iterdir()) if d.is_dir() and (d / 'README.md').exists() and (d / 'preview.html').exists()]
    plays, play_problems = read_plays({c['name'] for c in comps})
    if play_problems:
        sys.exit('playgrounds:\n  ' + '\n  '.join(play_problems))
    unknown = sorted({c['group'] for c in comps} - set(GROUPS))
    if unknown:
        sys.exit(f'groups without a place in the sidebar: {unknown}')
    all_blocks = read_blocks()
    blocks = [x for x in all_blocks if not x['problems']]
    skipped = [f'blocks/{x["name"]}.html: {"; ".join(x["problems"])}' for x in all_blocks if x['problems']]
    chart_groups = read_charts()
    charts = [c for g in chart_groups for c in g['charts']]
    sizes = {f: len(gzip.compress((DIST / f).read_bytes(), 9)) for f in ('tokens.css', 'components/bundle.css', 'components/bundle.js')}
    facts = {'components': len(comps), 'blocks': len(blocks), 'icons': len(icons), 'charts': len(charts), 'version': VERSION,
             'tokens': sum(len(v['tokens']) for v in tok.values() if isinstance(v, dict) and 'tokens' in v), 'kb': round(sum(sizes.values()) / 1024),
             'css_kb': round(sizes['components/bundle.css'] / 1024), 'js_kb': round(sizes['components/bundle.js'] / 1024), 'zip': f'trayui-{VERSION}.zip',
             'repo': LINKS.get('repo', '') if LINKS.get('public') else '', 'license': LINKS.get('license', ''), 'cdn': LINKS.get('cdn', '').rstrip('/'),
             'site': LINKS.get('site', '').rstrip('/'),
             'icon_wall': ''.join(icon(n) for n in sorted(icons)), 'themes': len(tok['color']['themes']),
             'theme_menu': theme_menu(theme_data(tok)['list']), 'mark': MARK, 'plays': len(plays)}

    def fill(text, more=None):
        """{{name}} in the site's own pages stands for a fact about this build; more holds the facts of one page."""
        known = dict(facts, **(more or {}))
        text = re.sub(r'\{\{#(\w+)\}\}(.*?)\{\{/\1\}\}', lambda m: m.group(2) if known.get(m.group(1)) else '', text, flags=re.S)
        text = re.sub(r'\{\{\^(\w+)\}\}(.*?)\{\{/\1\}\}', lambda m: '' if known.get(m.group(1)) else m.group(2), text, flags=re.S)
        return re.sub(r'\{\{(\w+)\}\}', lambda m: str(known[m.group(1)]), text)

    # ---------- the docs section: the site's own pages, the foundations, the guides of the system ----------
    docs = [read_page(SRC / 'pages' / f'{n}.md', 'd-' + n, '') for n in ('introduction', 'installation', 'theming', 'react', 'tailwind-figma', 'agents')]
    docs.append(read_page(ROOT.parent / 'CHANGELOG.md', 'd-changelog', ''))  # the changelog of the repository, as a page of the site
    for d in docs:
        d['summary'], d['guide'] = fill(d['summary']), fill(d['guide'])
    themes = theme_data(tok)
    docs.insert(3, {'id': 'd-themes', 'title': 'Themes', 'group': '', 'html': themes_page(themes), 'wide': True,
                    'summary': f'{len(themes["list"])} themes to choose from, and a maker for your own: four colours in, a whole theme out.'})
    foundations = [{'id': 'f-colours', 'title': 'Colours', 'summary': f'The {len(tok["color"]["tokens"])} colour tokens in the Light and the Dark theme, and what each is for.', 'html': colours_page(tok)},
                   {'id': 'f-type', 'title': 'Typography', 'summary': 'The type styles: one family in two voices.', 'html': type_page(tok)},
                   {'id': 'f-scale', 'title': 'Space and shape', 'summary': 'Space, corners, sizes, the one shadow, and the rest of the scale.', 'html': scale_page(tok)},
                   {'id': 'f-icons', 'title': 'Icons', 'summary': f'{len(icons)} icons from Lucide built in, ready to copy, and how to use any other.', 'html': icons_page(icons)}]
    for f in foundations:
        f['group'] = 'Foundations'
    guides = []
    for f in sorted((P / 'guides').glob('*.md')):
        if f.stem in ('0-components', '5-blocks'):
            continue  # the two lists: this site is those lists
        guides.append(read_page(f, 'g-' + re.sub(r'^\d+-', '', f.stem), 'Guides'))
    brand = {'id': 'g-brand', 'title': 'The brand book', 'group': 'Guides', 'summary': 'The rules of the system in one page: content, colour, type, shape, layout, motion and icons.',
             'guide': (P / 'README.md').read_text(encoding='utf-8').strip()}
    guides.insert(0, brand)

    def grouped(items, order):
        return [(g, [x for x in items if x['group'] == g]) for g in order if any(x['group'] == g for x in items)]
    entry = lambda x: {'id': x['id'], 'title': x['title']}
    doc_nav = [{'group': '', 'items': [entry(d) for d in docs]}, {'group': 'Foundations', 'items': [entry(f) for f in foundations]}, {'group': 'Guides', 'items': [entry(g) for g in guides]}]
    comp_nav = [{'group': '', 'items': [{'id': 'components', 'title': 'All components'}]}] + [{'group': g, 'items': [entry(c) for c in items]} for g, items in grouped(comps, GROUPS)]
    block_groups = grouped(blocks, BLOCK_GROUPS)
    block_nav = [{'group': '', 'items': [{'id': 'blocks', 'title': 'All blocks'}]}] + [{'group': g, 'items': [entry(x) for x in items]} for g, items in block_groups]
    chart_use = read_page(SRC / 'pages' / 'charts.md', 'ch-use', '')
    chart_use['summary'], chart_use['guide'] = fill(chart_use['summary']), fill(chart_use['guide'])
    for g in chart_groups:
        g['page'] = 'ch-' + g['id']
    forms, ready = [g for g in chart_groups if g['id'] != 'ready'], [g for g in chart_groups if g['id'] == 'ready']
    chart_nav = [{'group': '', 'items': [{'id': 'charts', 'title': 'All charts'}, entry(chart_use)]},
                 {'group': 'By form', 'items': [{'id': g['page'], 'title': g['nav']} for g in forms]},
                 {'group': 'Ready-made', 'items': [{'id': g['page'], 'title': g['nav']} for g in ready]}]
    sections = [{'id': 'docs', 'title': 'Docs', 'home': 'd-introduction', 'nav': doc_nav},
                {'id': 'components', 'title': 'Components', 'home': 'components', 'nav': comp_nav},
                {'id': 'blocks', 'title': 'Blocks', 'home': 'blocks', 'nav': block_nav},
                {'id': 'charts', 'title': 'Charts', 'home': 'charts', 'nav': chart_nav}]

    # Where a page's content travels: 'core' is data.js, loaded on every visit; a section's name is data-<section>.js, loaded
    # with the first page of that section; 'pages/<id>' is pages/<id>.js, that page alone, so a link straight to it loads
    # only what it shows.
    index, chunks, runs = {}, {'core': {}}, {}

    def page(ident, title, group, section, chunk, body, summary='', **more):
        index[ident] = {'title': title, 'group': group, 'section': section, 'chunk': chunk, 'summary': summary, 'path': route(ident)}
        chunks.setdefault(chunk, {})[ident] = dict({'html': body}, **more)

    # home: the landing page, with its facts filled in
    page('home', 'Tray UI', '', '', 'core', fill((SRC / 'home.html').read_text(encoding='utf-8')), 'A design system in plain HTML and CSS.', wide=True, needs=['blocks'])

    # docs
    seq = docs + foundations + guides
    for i, p in enumerate(seq):
        prev, nxt = (seq[i - 1] if i else None), (seq[i + 1] if i + 1 < len(seq) else None)
        body = p.get('html') or f'<article class="site-prose">{markdown(p["guide"], p["id"])}</article>'
        page(p['id'], p['title'], p['group'], 'docs', 'pages/' + p['id'], head(p['title'], p['summary']) + body + pager(prev, nxt), p['summary'], **({'wide': True} if p.get('wide') else {}))

    # components: an index, then a page each
    cards = ''.join(
        f'<section class="tray-card site-group"><h2>{html.escape(g)}</h2><ul>' + ''.join(f'<li><a href="#{x["id"]}">{html.escape(x["title"])}</a></li>' for x in items) + '</ul></section>'
        for g, items in grouped(comps, GROUPS))
    order = [c for g in GROUPS for c in comps if c['group'] == g]
    page('components', 'Components', '', 'components', 'core',
         head('Components', f'{len(comps)} components in plain HTML and CSS, with one small script for behaviour. Each has a page: a live example, its markup, and when to use it.')
         + f'<div class="site-groups">{cards}</div>' + pager(None, order[0]), f'All {len(comps)} components, group by group.', wide=True)
    for i, p in enumerate(order):
        prev, nxt = (order[i - 1] if i else {'id': 'components', 'title': 'All components'}), (order[i + 1] if i + 1 < len(order) else None)
        ident = p['id']
        example = (f'<section data-tray="tabs" aria-label="Example"><div class="tray-tabs" role="tablist" aria-label="Example">'
                   f'<button class="tray-tab" role="tab" aria-selected="true" aria-controls="site-live" id="site-t1" type="button">Preview</button>'
                   f'<button class="tray-tab" role="tab" aria-controls="site-src" id="site-t2" type="button">Markup</button></div>'
                   f'<div class="tray-tabpanel" role="tabpanel" id="site-live" aria-labelledby="site-t1"><div class="site-stage" style="min-block-size: {p["height"]}px">{p["body"]}</div></div>'
                   f'<div class="tray-tabpanel" role="tabpanel" id="site-src" aria-labelledby="site-t2" tabindex="0" hidden>{code_block(pretty(p["body"]), "html", "site-src-code")}</div></section>')
        spec = plays.get(p['name'])
        page(ident, p['title'], p['group'], 'components', 'pages/' + ident,
             head(p['title'], p['summary']) + example + (play_section(p, spec) if spec else '') + f'<article class="site-prose">{markdown(p["guide"], ident)}</article>' + pager(prev, nxt),
             p['summary'], **({'play': spec} if spec else {}))
        if p['script']:
            runs[ident] = p['script']

    # blocks: a gallery first, then a page each, shown live in a frame of its own
    galleries = (('blocks', blocks, block_groups, 'Blocks',
                  f'{len(blocks)} screens built from the components: copy one into a product and fill it. Each is a single page of plain HTML.',
                  '<p>A block is a composition, not a component: a dashboard, a sidebar in one of its variants, a sign-in page, a shop, an article. Open one to see it at desktop, tablet and phone width, in the theme you chose for this site, and to copy its code.</p>'),)
    for sec, items, groups, title, summary, lead in galleries:
        seq = [{'id': sec, 'title': 'All ' + sec}] + items
        page(sec, title, '', sec, 'core', gallery(title, summary, groups, lead) + pager(None, seq[1] if len(seq) > 1 else None), summary, wide=True, needs=[sec])
        for i, x in enumerate(items, 1):
            page(x['id'], x['title'], x['group'], sec, 'pages/' + x['id'], head(x['title'], x['summary']) + viewer(x) + pager(seq[i - 1], seq[i + 1] if i + 1 < len(seq) else None),
                 x['summary'], wide=True, source=x['source'])

    # charts: an overview with two of each form, how to use them, then a page for each form with every example drawn live
    count = lambda g: f'{len(g["charts"])} {g["title"].lower()}' if g['id'] != 'ready' else f'{len(g["charts"])} examples'
    lead = ('<section class="site-prose"><p>In React, a chart is a <a href="https://recharts.github.io">Recharts</a> chart inside the frame of this system: '
            'the package brings the title, the colours, the tooltip, the key and the table of figures, and the stylesheet restyles the marks. '
            'Each example is one file to copy; <a href="#ch-use">Using the charts</a> says how they are put together. Every figure here is invented.</p>'
            + code_block("npm install recharts", 'sh', 'charts-code-1') + '</section>')
    over = head('Charts', f'{len(charts)} charts for React, drawn with Recharts in the style of the system: area, bar, line, pie, radar and radial, in every theme.') + lead
    for g in chart_groups:
        some = [c for c in g['charts'] if not c.get('wide')][:2]
        over += (f'<section class="site-prose site-chartrow"><div class="site-chartrow__head"><div><h2 class="subtitle">{html.escape(g["title"])}</h2><p>{html.escape(g["summary"])}</p></div>'
                 f'<a class="tray-btn tray-btn--quiet tray-btn--sm" href="#{g["page"]}">All {count(g)}{icon("arrow-right", "tray-icon--flip")}</a></div>'
                 f'<div class="site-charts site-charts--pair">{"".join(chart_card(c, g, "h3") for c in some)}</div></section>')
    chart_seq = [{'id': 'charts', 'title': 'All charts'}, chart_use] + [{'id': g['page'], 'title': g['title']} for g in chart_groups]
    page('charts', 'Charts', '', 'charts', 'charts', over + pager(None, chart_seq[1]), f'All {len(charts)} charts, form by form.', wide=True)
    page('ch-use', chart_use['title'], '', 'charts', 'charts',
         head(chart_use['title'], chart_use['summary']) + f'<article class="site-prose">{markdown(chart_use["guide"], "ch-use")}</article>' + pager(chart_seq[0], chart_seq[2]), chart_use['summary'])
    note = ('<article class="site-prose"><p>Each example is one React file: choose <b>Code</b> above a chart and copy it into a project that has <code class="tray-code-inline">recharts</code> and '
            '<code class="tray-code-inline">trayui-react</code>. The names and the figures are invented: replace them. <a href="#ch-use">Using the charts</a> explains the parts.</p></article>')
    for i, g in enumerate(chart_groups, 2):
        group = 'Ready-made' if g['id'] == 'ready' else 'By form'
        body = head(g['title'], g['summary']) + f'<div class="site-charts">{"".join(chart_card(c, g) for c in g["charts"])}</div>' + note
        page(g['page'], g['title'], group, 'charts', 'charts', body + pager(chart_seq[i - 1], chart_seq[i + 1] if i + 1 < len(chart_seq) else None), g['summary'], wide=True)

    # ---------- addresses: one for each page, and every link between pages by its address ----------
    taken = {}
    for ident, meta in index.items():
        if meta['path'] in taken:
            sys.exit(f'two pages have the address /{meta["path"]}: {taken[meta["path"]]} and {ident}')
        taken[meta['path']] = ident
    for pages_ in chunks.values():
        for p in pages_.values():
            p['html'] = addressed(p['html'], index)
    facts['theme_menu'] = addressed(facts['theme_menu'], index)

    # ---------- write the site ----------
    if OUT.exists():
        shutil.rmtree(OUT)
    (OUT / 'components').mkdir(parents=True)
    (OUT / 'fonts').mkdir()
    for rel in ('tokens.css', 'components/bundle.css', 'components/bundle.js'):
        shutil.copyfile(DIST / rel, OUT / rel)
    for f in (DIST / 'fonts').iterdir():
        shutil.copyfile(f, OUT / 'fonts' / f.name)
    for folder in ('tailwind', 'figma'):  # the tokens for other tools, to link and download from the Tailwind and Figma page
        if (DIST / folder).exists():
            shutil.copytree(DIST / folder, OUT / folder)
    shutil.copytree(P / 'assets' / 'Media', OUT / 'assets' / 'Media')  # the pictures and the film of the Lightbox and Video Player previews
    for name in ('site.css', 'site.js', 'theme.js', 'themes.js', 'playground.js', '_headers'):  # _headers is read by the host (Cloudflare Workers), not served
        shutil.copyfile(SRC / name, OUT / name)
    (OUT / '404.html').write_text(addressed(fill((SRC / '404.html').read_text(encoding='utf-8')), index), encoding='utf-8')  # what the host serves for a wrong address
    # Every page in a file of its own, drawn in it, so a link straight to a page shows it before any script runs; site.js
    # keeps what it finds and only wires it. The host serves components/lightbox.html at /components/lightbox. index.html is
    # the home page, and also the whole site where pages go by hash (framed inside another page): it links its
    # files from where it stands, every other page from the root.
    template = (SRC / 'index.html').read_text(encoding='utf-8')
    by_id = {sec['id']: sec for sec in sections}
    own_pages = json.dumps(sorted(i for i, m in index.items() if m['chunk'].startswith('pages/')), separators=(',', ':'))
    plain = lambda s: html.escape(re.sub(r'\[([^\]]+)\]\([^)]*\)', r'\1', s).replace('`', '').replace('**', ''))

    def nav_html(sec, here):
        """The sidebar of a section, as site.js draws it, with the page shown marked."""
        out = ''
        for g in sec['nav']:
            out += '<div class="tray-sidebar__group">' + (f'<p class="tray-sidebar__label">{html.escape(g["group"])}</p>' if g['group'] else '')
            out += ''.join(f'<a class="tray-sidebar__item" href="/{route(it["id"])}"' + (' aria-current="page"' if it['id'] == here else '')
                           + f'><span>{html.escape(it["title"])}</span></a>' for it in g['items'])
            out += '</div>'
        return out

    for ident, meta in index.items():
        sec, home, entry = by_id.get(meta['section']), ident == 'home', chunks[meta['chunk']][ident]
        chunk = meta['chunk']
        one = {'home': home, 'root': '' if home else '/', 'route': meta['path'], 'page_id': ident, 'section': sec['id'] if sec else '',
               'page_title': 'Tray UI: a design system in plain HTML and CSS' if home else html.escape(f'{meta["title"]} - Tray UI'),
               'page_name': html.escape(meta['title']), 'page_description': plain(meta['summary']),
               'page_url': f'{facts["site"]}/{meta["path"]}' if facts['site'] else '',
               'nav_html': nav_html(sec, ident) if sec else '', 'view_html': entry['html'], 'wide': entry.get('wide', False),
               'sections_tabs': ''.join(f'<a class="tray-tab" href="/{route(s["home"])}"' + (' aria-current="page"' if s is sec else '') + f'>{html.escape(s["title"])}</a>' for s in sections),
               'preload': '' if chunk == 'core' else chunk + '.js' if chunk.startswith('pages/') else f'data-{chunk}.js',
               'own_pages': own_pages if home else ''}
        out = OUT / ('index.html' if home else meta['path'] + '.html')
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(addressed(fill(template, one), index), encoding='utf-8')
    if facts['site']:  # every address, for a search engine, once the site is open to everyone
        (OUT / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
                                         + ''.join(f'  <url><loc>{html.escape(facts["site"] + "/" + m["path"])}</loc></url>\n' for m in index.values()) + '</urlset>\n', encoding='utf-8')
    dump = lambda o: json.dumps(o, ensure_ascii=False).replace('</', '<\\/')
    (OUT / 'data.js').write_text(
        '/* Generated by tools/site.py: the map of the site, and the pages every visit may need. */\n'
        'window.TRAY_SITE = ' + dump({'version': VERSION, 'repo': facts['repo'], 'site': facts['site'], 'sections': sections, 'index': index, 'pages': chunks['core'], 'themes': themes}) + ';\nwindow.TRAY_SITE.run = {};\n', encoding='utf-8')
    for name, pages_ in chunks.items():
        if name == 'core':
            continue
        more = {'code': {c['id']: colour(c['source'], 'tsx') for c in charts}} if name == 'charts' else {}  # coloured: the sheet shows it as HTML
        own = [i for i in pages_ if i in runs]  # the preview scripts of the pages in this file
        tail = 'window.TRAY_SITE.add(' + json.dumps(name) + ', ' + dump(dict({'pages': pages_}, **more)) + (
            ', {\n' + ',\n'.join(f'  {json.dumps(i)}: function () {{\n{runs[i]}\n  }}' for i in own) + '\n}' if own else '') + ');\n'
        alone = name.startswith('pages/')
        out = OUT / (name + '.js' if alone else f'data-{name}.js')
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(f'/* Generated by tools/site.py: {"the page " + name[6:] + ", loaded when it is opened" if alone else "the pages of the " + name + " section, loaded when one of them is opened"}. */\n' + tail, encoding='utf-8')

    colour.close()
    bundled = bundle_charts(OUT / 'charts.js')  # charts.js and, beside it, the licences of what it holds
    bundled_code = bundle_code(OUT / 'code.js')  # code.js and its licence
    # the download: dist/ as one archive, with the blocks beside the three files
    with zipfile.ZipFile(OUT / facts['zip'], 'w', zipfile.ZIP_DEFLATED) as z:
        for f in sorted(DIST.rglob('*')):
            if f.is_file() and not f.name.startswith('.'):
                z.write(f, f'trayui/{f.relative_to(DIST)}')
    # llms.txt: the system in one plain file, for an agent to read before it writes with it
    comp_index = (P / 'guides' / '0-components.md').read_text(encoding='utf-8')
    comp_index = re.sub(r' \[The component browser\]\([^)]*\) shows them[^\n]*', '', comp_index)
    parts = [f'# Tray UI {VERSION}\n\n> A design system in plain HTML and CSS: {len(comps)} components, {len(blocks)} blocks, {len(icons)} icons, {len(tok["color"]["themes"])} themes. '
             'Link tokens.css, components/bundle.css and components/bundle.js; write HTML with tray- classes; behaviours attach with data-tray.\n',
             '# Rules\n\n' + (P / 'README.md').read_text(encoding='utf-8').strip() + '\n']
    parts += [(P / 'guides' / f).read_text(encoding='utf-8').strip() + '\n' for f in ('1-grounds.md', '2-behaviour.md', '3-accessibility.md', '4-layouts.md')]
    parts.append(comp_index.strip() + '\n')
    parts.append('# Markup of every component\n\nThe guidelines of each component, with its markup, in the order of the index.\n')
    parts += ['#' + (P / 'components' / c['name'] / 'README.md').read_text(encoding='utf-8').strip() + '\n' for c in order]
    parts.append('# Tailwind and Figma\n\n' + fill(re.sub(r'^# .*\n', '', (SRC / 'pages' / 'tailwind-figma.md').read_text(encoding='utf-8').strip(), count=1).strip()) + '\n')
    parts.append('# Charts in React\n\n' + re.sub(r'^# .*\n', '', (SRC / 'pages' / 'charts.md').read_text(encoding='utf-8').strip(), count=1).strip() + '\n')
    (OUT / 'llms.txt').write_text('\n'.join(parts), encoding='utf-8')

    size = sum(f.stat().st_size for f in OUT.rglob('*') if f.is_file())
    first = sum((OUT / f).stat().st_size for f in ('index.html', 'site.css', 'site.js', 'data.js', 'tokens.css', 'components/bundle.css', 'components/bundle.js'))
    print(bundled)
    print(bundled_code)
    print(f'site: {len(plays)} playgrounds')
    print(f'site: {len(index)} pages ({len(comps)} components, {len(blocks)} blocks, {len(charts)} charts, {len(docs) + len(foundations) + len(guides)} docs), '
          f'{len(runs)} preview scripts; first load {first // 1024} KB, all {size // 1024} KB in {len(list(OUT.rglob("*.*")))} files')
    for line in skipped:
        print('LEFT OUT', line)


if __name__ == '__main__':
    build()
