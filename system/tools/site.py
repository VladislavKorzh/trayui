#!/usr/bin/env python3
"""Build site/: the website of the design system.

    python3 tools/site.py

It reads what the design system publishes (project/README.md, tokens.json, guides/*.md, components/<Name>/preview.html and
README.md, blocks/*.html, templates/*.html), the icons and the site's own pages (tools/site/home.html, tools/site/pages/*.md),
and writes one static site: a file for every page, drawn in it, at the page's address (index.html, docs/installation.html,
components/lightbox.html: the host serves it at /components/lightbox), site.css, site.js, data.js (the map of the site), one
pages/<id>.js per page (a doc, a component, a block, a template: moving to a page loads that page alone), charts.js,
sitemap.xml, the files of dist/
(so the site is also where the three files can be linked or downloaded from), a zip of dist/ and llms.txt.

The Charts section shows the chart examples of the React package (react/examples/charts). They are drawn live, so the build
bundles them, with React and Recharts, into charts.js: that step runs node, and installs react/ with `npm ci` the first time.
Code is coloured by highlight.js, from the same package: the build colours every code block it writes (react/scripts/code.mjs,
one node process for the whole build), and code.js colours the code the page writes itself, loaded the first time it is needed.

On the web every page has an address of its own; framed inside another page, only a # may reach it, so there
index.html alone shows every page by hash (#c-lightbox). Run tools/build.py first, then python3 tools/serve.py: it serves
site/ at the same addresses as the host.

The site's own files (its stylesheet and scripts, the pages' scripts, and its copies of the three files) are written to
_/ with a hash of their content in the name, so the host may let a browser keep them for a year (_headers); the three
files also stay at their plain addresses, for other sites to link. For readers that are not people, every page also
comes as Markdown at its address with .md added, llms.txt is the index of them, and llms-full.txt holds the whole
system in one file. tools/og.py draws the picture a link to each page shows.
"""
import gzip, hashlib, html, html.parser, json, os, pathlib, re, shutil, subprocess, sys, urllib.parse, zipfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
P, SRC, DIST, OUT = ROOT / 'project', ROOT / 'tools' / 'site', ROOT / 'dist', ROOT / 'site'
REACT, CHARTS = ROOT / 'react', ROOT / 'react' / 'examples' / 'charts'
LINKS = json.loads((ROOT / 'tools' / 'links.json').read_text(encoding='utf-8'))
VERSION = LINKS.get('version', '0.1.0')
PUBLIC = bool(LINKS.get('public'))  # the repository is open: the site may link it, and jsDelivr serves its releases
NPM = bool(LINKS.get('npm'))  # trayui and trayui-react are on npm: the site says to install them, and jsDelivr serves the files from there
CDN = (f'https://cdn.jsdelivr.net/npm/trayui@{VERSION}' if NPM else LINKS.get('cdn', '').replace('{version}', VERSION) if PUBLIC
       else LINKS.get('site', '')).rstrip('/')
from build import BLOCK_GROUPS, GROUPS, TEMPLATE_GROUPS, dark_themes, read_blocks, read_templates  # the order of the groups, the blocks, the templates, and which themes are dark
import og

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
SECTION_OF = {'d': 'docs', 'f': 'docs', 'g': 'docs', 'c': 'components', 'b': 'blocks', 't': 'templates', 'ch': 'charts', 'a': 'articles'}
# The words people search with: the name a page's title starts with, and what else a component is called (tools/site/search.json)
SEARCH = json.loads((SRC / 'search.json').read_text(encoding='utf-8'))
MONTHS = ('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December')


def day(iso):
    """'2026-11-17' as people read it: 17 November 2026."""
    y, m, d = (int(x) for x in iso.split('-'))
    return f'{d} {MONTHS[m - 1]} {y}'


def route(ident):
    """The address of a page with no slash at either end: '' is the home page, 'components/lightbox' a component."""
    if ident in ADDRESSES:
        return ADDRESSES[ident]
    if ident in ('components', 'blocks', 'templates', 'charts', 'articles'):
        return ident
    prefix, _, rest = ident.partition('-')
    if prefix == 'at':  # a topic of the articles: the articles on it, newest first
        return f'articles/topics/{rest}'
    if prefix == 'ap':  # a later page of the list of the articles: ap-2
        return f'articles/page/{rest}'
    if prefix == 'atp':  # a later page of a topic: atp-<topic>-<page>
        topic, _, n = rest.rpartition('-')
        return f'articles/topics/{topic}/page/{n}'
    return f'{SECTION_OF[prefix]}/{rest}'


# The list of the articles, and the list of each topic, go by pages: the first has the newest article large and the next
# twelve in a grid, each page after it twelve in the grid, four rows of three.
PER_PAGE = 12


def paged(items):
    """A list of articles, page by page."""
    first, rest = items[:1 + PER_PAGE], items[1 + PER_PAGE:]
    return [first] + [rest[i:i + PER_PAGE] for i in range(0, len(rest), PER_PAGE)]


def page_of_list(owner, n):
    """The id of a page of a list: owner is 'articles' or a topic (at-components); its first page is the owner itself."""
    if n == 1:
        return owner
    return f'ap-{n}' if owner == 'articles' else f'atp-{owner[3:]}-{n}'


def addressed(text, known):
    """The sources link a page by its id (href="#c-lightbox"); the site links it by its address (href="/components/lightbox").
    An icon (#tray-i-…) and a link inside an example (#, #orders) name no page, and stay as they are."""
    return re.sub(r'href="#([a-z0-9-]+)"', lambda m: f'href="/{route(m.group(1))}"' if m.group(1) in known else m.group(0), text)


def icon(name, cls=''):
    return f'<svg class="tray-icon{" " + cls if cls else ""}" aria-hidden="true"><use href="#tray-i-{name}"/></svg>'


def unmark(text):
    """Inline Markdown as plain text: a link keeps its words, code and bold lose their marks."""
    return ' '.join(re.sub(r'\[([^\]]+)\]\([^)]*\)', r'\1', text).replace('`', '').replace('**', '').split())


def anchor(text):
    """The id a heading of an article takes, from its words: 'The events a script listens to' -> the-events-a-script-listens-to."""
    return re.sub(r'[^a-z0-9]+', '-', unmark(text).lower()).strip('-')


def contents(md):
    """The h2 and h3 of an article, outside its code: (level, words, id) for its list of contents."""
    out, fence = [], False
    for line in md.split('\n'):
        if line.startswith('```'):
            fence = not fence
        elif not fence and re.match(r'#{2,3} ', line):
            level, _, words = line.partition(' ')
            out.append((len(level), words.strip(), anchor(words)))
    return out


def minutes(md):
    """How long an article takes to read, its code left out: 220 words a minute."""
    return max(1, round(len(re.sub(r'```.*?```', ' ', md, flags=re.S).split()) / 220))


def fit(text, tail=''):
    """A description for a search result: whole, with the tail after it when both fit in 160 characters; cut at the last
    clause that fits when the text alone is longer."""
    text = unmark(text)
    if tail and len(text) + 1 + len(tail) <= 160:
        return f'{text} {tail}'
    if len(text) <= 160:
        return text
    cut = text[:158]
    for mark in ('. ', '; ', ': ', ', '):
        at = cut.rfind(mark)
        if at >= 70:
            return cut[:at] + '.'
    return cut[:cut.rfind(' ')] + '…'


def demoted(markup):
    """A preview as the page shows it live, under the page's own <h1> and inside its <main>: its h1 becomes an h2 and its
    main a div. The classes set the look, so nothing changes to the eye; the markup to copy keeps the original."""
    markup = re.sub(r'<h1(?=[\s>])', '<h2', markup).replace('</h1>', '</h2>')
    return re.sub(r'<main(?=[\s>])', '<div', markup).replace('</main>', '</div>')


def headings(md, level):
    """Markdown set under a heading of its own: its first heading becomes that level, and the others move down with it."""
    out, fence, shift = [], False, None
    for line in md.strip('\n').split('\n'):
        if line.startswith('```'):
            fence = not fence
        elif not fence:
            m = re.match(r'(#{1,6}) ', line)
            if m:
                if shift is None:
                    shift = level - len(m.group(1))
                line = '#' * min(6, max(1, len(m.group(1)) + shift)) + line[len(m.group(1)):]
        out.append(line)
    return '\n'.join(out)


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


def markdown(text, prefix, anchors=False):
    """The Markdown the guidelines and the site's pages use: h2, h3, paragraphs, bullet and numbered lists, pipe tables, fenced code.
    With anchors, each h2 and h3 has an id from its words, for an article's list of contents to link to."""
    out, lines, i, n = [], text.strip('\n').split('\n'), 0, 0
    at = lambda words: f' id="{anchor(words)}"' if anchors else ''
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
            out.append(f'<h3 class="site-h3"{at(line[4:])}>{inline(line[4:])}</h3>'); i += 1
        elif line.startswith('## '):
            out.append(f'<h2 class="subtitle"{at(line[3:])}>{inline(line[3:])}</h2>'); i += 1
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
    wide = re.search(r'width=(\d+)', marker)
    return {'name': d.name, 'id': 'c-' + slug(d.name), 'title': title, 'group': group, 'height': height, 'body': body, 'stage': demoted(body),
            'script': '\n'.join(s.strip() for s in scripts), 'summary': summary.replace('\n', ' '), 'guide': guide, 'readme': readme,
            'width': int(wide.group(1)) if wide else 0}


def read_page(f, ident, group):
    """A page of the site written in Markdown: a title, one paragraph of summary, then the body."""
    text = f.read_text(encoding='utf-8').strip()
    title = text.split('\n', 1)[0].lstrip('# ').strip()
    rest = text.split('\n', 1)[1].strip()
    summary, _, body = rest.partition('\n\n')
    return {'id': ident, 'title': title, 'summary': summary.replace('\n', ' '), 'guide': body, 'group': group}


def read_articles():
    """The articles, newest first, and their topics. tools/site/articles/<name>.md is an article, listed in articles.json with
    the day it was published, its topic and a short name for the way back to it. An article the list leaves out, or a name with
    no file, stops the build. Each has a picture beside it, <name>.svg, drawn in the colour tokens so it wears the theme of the
    site; an article without one stops the build too. topics.json names the topics in the order of their tabs, each with the
    title and the summary of its page; an article on a topic it does not name stops the build."""
    folder = SRC / 'articles'
    if not folder.exists():
        return [], []
    topics = [dict(t, id='at-' + anchor(t['name'])) for t in json.loads((folder / 'topics.json').read_text(encoding='utf-8'))]
    listed = json.loads((folder / 'articles.json').read_text(encoding='utf-8'))
    unknown = sorted({a['topic'] for a in listed} - {t['name'] for t in topics})
    if unknown:
        sys.exit(f'tools/site/articles/articles.json: the topics {unknown} are not in topics.json')
    names, on_disk = sorted(a['name'] for a in listed), sorted(f.stem for f in folder.glob('*.md'))
    if names != on_disk:
        sys.exit(f'tools/site/articles: articles.json lists {names}, the folder holds {on_disk}')
    out = []
    for a in listed:
        p = read_page(folder / f'{a["name"]}.md', 'a-' + a['name'], a['topic'])
        if not re.fullmatch(r'\d{4}-\d\d-\d\d', a['published']):
            sys.exit(f'tools/site/articles/articles.json: {a["name"]} was published on {a["published"]!r}, not a day as 2026-11-17')
        art = folder / f'{a["name"]}.svg'
        if not art.exists():
            sys.exit(f'tools/site/articles: {a["name"]} has no picture: draw {a["name"]}.svg (a 480 by 270 viewBox, its colours the tokens of the theme)')
        svg = re.sub(r'>\s+<', '><', re.sub(r'<!--.*?-->', '', art.read_text(encoding='utf-8'), flags=re.S).strip())
        if not svg.startswith('<svg ') or ' id="' in svg:  # a picture shows on several pages, beside others: an id inside it could clash
            sys.exit(f'tools/site/articles/{a["name"]}.svg: one <svg> with no id inside')
        p.update(published=a['published'], nav=a.get('nav') or p['title'], minutes=minutes(p['guide']), contents=contents(p['guide']),
                 art=svg.replace('<svg ', '<svg aria-hidden="true" focusable="false" ', 1),
                 src=[f'system/tools/site/articles/{a["name"]}.md', f'system/tools/site/articles/{a["name"]}.svg'])
        out.append(p)
    out.sort(key=lambda p: p['published'], reverse=True)  # the same day keeps the order of the list
    for t in topics:
        t['articles'] = [p for p in out if p['group'] == t['name']]
    return out, [t for t in topics if t['articles']]


def head(title, summary, actions=''):
    return ('<div class="tray-pagehead"><div class="tray-pagehead__row"><div class="tray-pagehead__text">'
            f'<h1 class="title" tabindex="-1">{html.escape(title)}</h1><p>{inline(summary)}</p></div>'
            + (f'<div class="tray-pagehead__actions">{actions}</div>' if actions else '') + '</div></div>')


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


# A component by its own class, or by the behaviour that makes it, to say which components a block is made of. A class
# that many components share (tray-pop, tray-anchor, tray-list) names none of them.
OWN = {'tray-accordion': 'Accordion', 'tray-feed': 'ActivityFeed', 'tray-alert': 'Alert', 'tray-secret': 'ApiKeys', 'tray-app': 'AppShell',
       'tray-ratio': 'AspectRatio', 'tray-attachment': 'Attachment', 'tray-auth': 'AuthForm', 'tray-avatar': 'Avatar', 'tray-badge': 'Badge',
       'tray-banner': 'Banner', 'tray-billing': 'BillingSummary', 'tray-crumbs': 'Breadcrumb', 'tray-bubble': 'Bubble', 'tray-btn': 'Button',
       'tray-btn-group': 'ButtonGroup', 'tray-cal': 'Calendar', 'tray-cta': 'CallToAction', 'tray-card': 'Card', 'tray-carousel': 'Carousel',
       'tray-changelog': 'Changelog', 'tray-chart': 'Chart', 'tray-check': 'Checkbox', 'tray-summary': 'CheckoutSummary', 'tray-code': 'CodeBlock',
       'tray-collapsible': 'Collapsible', 'tray-command': 'Command', 'tray-context': 'ContextMenu', 'tray-consent': 'CookieConsent',
       'tray-datatable': 'DataTable', 'tray-datepicker': 'DatePicker', 'tray-dl': 'DescriptionList', 'tray-dialog': 'Dialog', 'tray-drawer': 'Drawer',
       'tray-empty': 'Empty', 'tray-feature': 'FeatureGrid', 'tray-feedback': 'FeedbackWidget', 'tray-field': 'Field', 'tray-drop': 'FileUpload',
       'tray-filterbar': 'FilterBar', 'tray-footer': 'Footer', 'tray-hero': 'Hero', 'tray-input': 'Input', 'tray-input-group': 'InputGroup',
       'tray-otp': 'InputOTP', 'tray-integration': 'IntegrationCard', 'tray-invite': 'InviteForm', 'tray-item': 'Item', 'tray-kbd': 'Kbd',
       'tray-label': 'Label', 'tray-lightbox': 'Lightbox', 'tray-marker': 'Marker', 'tray-menubar': 'Menubar', 'tray-message': 'Message',
       'tray-scroller': 'MessageScroller', 'tray-select': 'NativeSelect', 'tray-nav': 'NavigationMenu', 'tray-notices': 'NotificationCenter',
       'tray-matrix': 'NotificationPreferences', 'tray-checklist': 'OnboardingChecklist', 'tray-pagehead': 'PageHeader', 'tray-pages': 'Pagination',
       'tray-choices': 'PaymentMethod', 'tray-compare': 'PlanComparison', 'tray-plans': 'PricingTable', 'tray-progress': 'Progress',
       'tray-questionnaire': 'Questionnaire', 'tray-radio-group': 'RadioGroup', 'tray-split': 'Resizable', 'tray-scroll': 'ScrollArea',
       'tray-select-trigger': 'Select', 'tray-rule': 'Separator', 'tray-settings': 'SettingsSection', 'tray-sheet': 'Sheet', 'tray-sidebar': 'Sidebar',
       'tray-skeleton': 'Skeleton', 'tray-slider': 'Slider', 'tray-spinner': 'Spinner', 'tray-stat': 'StatCard', 'tray-stepper': 'Stepper',
       'tray-switch': 'Switch', 'tray-table': 'Table', 'tray-tabs': 'Tabs', 'tray-tags': 'TagInput', 'tray-testimonial': 'Testimonial',
       'tray-textarea': 'Textarea', 'tray-toast': 'Toast', 'tray-toggle': 'Toggle', 'tray-seg': 'ToggleGroup', 'tray-topbar': 'TopBar',
       'tray-tour': 'Tour', 'tray-trace': 'Trace', 'tray-upsell': 'UpgradePrompt', 'tray-uptime': 'Uptime', 'tray-usage': 'UsageMeter',
       'tray-player': 'VideoPlayer', 'tray-switcher': 'WorkspaceSwitcher'}
OWN_BEHAVIOUR = {'menu': 'DropdownMenu', 'tooltip': 'Tooltip', 'hovercard': 'HoverCard', 'popover': 'Popover', 'combobox': 'Combobox'}


def built_from(source, comps):
    """The components a block is made of, in the order it first uses them: each by its own class or its behaviour."""
    by_name, seen = {c['name']: c for c in comps}, []
    for m in re.finditer(r'\btray-[a-z0-9-]+|data-tray="([a-z -]+)"', source):
        names = [OWN_BEHAVIOUR.get(b) for b in m.group(1).split()] if m.group(1) else [OWN.get(re.sub(r'(__|--).*$', '', m.group(0)))]
        for n in names:
            if n in by_name and by_name[n] not in seen:
                seen.append(by_name[n])
    return seen


def made_of(parts, tail):
    """The sentence that names the components a page is made of, each linked to its page."""
    named = lambda t: t.lower() if t[1:] == t[1:].lower() else t  # "Button" reads as "button" in a sentence; "Input OTP" stays
    links = [f'<a href="#{c["id"]}">{html.escape(named(c["title"]))}</a>' for c in parts]
    return f'<p>It is made of {", ".join(links[:-1]) + " and " + links[-1] if len(links) > 1 else links[0]}: {tail}</p>' if links else ''


def viewer(p, parts, about=''):
    """The page of one block or template: the live frame at a chosen width, and its code, which is in the page as it comes.
    about: what the screen is for and when to choose it, in Markdown (tools/site/block-notes/<name>.md)."""
    uses = ' '.join(f'<code class="tray-code-inline">{b}</code>' for b in p['behaviours'])
    made = made_of(parts, 'each component has a page with its markup and its rules.')
    note = ((markdown(about, p['id'] + '-about') if about else '') + made
            + '<p>Copy the page, or the part of it you need, into a project that links <code class="tray-code-inline">tokens.css</code>, '
            '<code class="tray-code-inline">components/bundle.css</code> and <code class="tray-code-inline">components/bundle.js</code>; the paths in its '
            '<code class="tray-code-inline">&lt;head&gt;</code> assume the page sits one folder below them, as it does in the <a href="#d-installation">download</a>. '
            + ('Its names, figures and quotes are invented: replace them. ' if p['id'].startswith('t-') else 'The grey trays stand in for your content. ' if p['slots'] else '')
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
            f'<div class="tray-code" dir="ltr"><div class="tray-code__head"><span>HTML</span></div><pre tabindex="0"><code id="site-src-code">{colour(p["source"], "html")}</code></pre></div></div></section>'
            f'<article class="site-prose">{note}</article>')


# GitHub's mark, in Lucide's drawing (react-icons/lu, LuGithub): the site's own, not one of the system's icons.
GITHUB_MARK = ('<svg class="tray-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5'
               '.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65'
               '-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>')


def stars(repo):
    """The stars of the repository on GitHub, asked once while the site is built (so a visitor's page asks GitHub nothing),
    or None when GitHub does not answer. GITHUB_TOKEN, when it is set, lifts the limit on asking."""
    import urllib.request
    path = urllib.parse.urlsplit(repo).path.strip('/')
    if not path:
        return None
    ask = urllib.request.Request(f'https://api.github.com/repos/{path}', headers={'Accept': 'application/vnd.github+json', 'User-Agent': 'trayui-site-build'})
    if os.environ.get('GITHUB_TOKEN'):
        ask.add_header('Authorization', f'Bearer {os.environ["GITHUB_TOKEN"]}')
    try:
        with urllib.request.urlopen(ask, timeout=8) as r:
            return int(json.loads(r.read())['stargazers_count'])
    except Exception:
        return None


def github_link(repo, count, cls=''):
    """The link to the repository, with its stars when they are known: "GitHub ★ 12", read as "GitHub 12 stars"."""
    short = '' if count is None else str(count) if count < 1000 else f'{count / 1000:.1f}'.rstrip('0').rstrip('.') + 'k'
    n = (f'<span class="site-stars__n">{icon("star", "tray-icon--sm")}{short}<span class="tray-vh"> {"star" if count == 1 else "stars"}</span></span>'
         if short else '')
    return f'<a class="tray-btn tray-btn--quiet tray-btn--sm site-stars{" " + cls if cls else ""}" href="{html.escape(repo)}">{GITHUB_MARK}<span>GitHub</span>{n}</a>'


def gallery(title, summary, groups, lead, more=None):
    """A page of blocks, each as a small live picture, group by group. more: a group whose blocks also have a page of their own."""
    out = head(title, summary) + f'<section class="site-prose">{lead}</section>'
    for g, items in groups:
        cards = ''.join(f'<a class="site-thumb" href="#{x["id"]}"><span class="site-thumb__view" data-thumb="{x["id"]}"></span>'
                        f'<span class="site-thumb__text"><b>{html.escape(x["title"])}</b><small>{html.escape(x["summary"])}</small></span></a>' for x in items)
        name = html.escape(g) if not (more or {}).get(g) else f'<a href="#{more[g]}">{html.escape(g)}</a>'
        out += f'<section class="site-prose"><h2 class="subtitle">{name}</h2><div class="site-gallery">{cards}</div></section>'
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


def themes_page(data, first_css=''):
    """The Themes page: every theme as a card to choose, then the maker: a few colours in, a whole theme out. first_css: the rule the
    maker starts from (Light, as theme.js writes it), in the page before the maker's script runs, so the page keeps its length when it comes."""
    themes = data['list']
    def card(th):
        mini = ('<span class="site-mini"><span class="site-mini__text"><b>Aa</b><i></i><i></i></span><span class="site-mini__tray"><i></i><i></i></span>'
                '<span class="site-mini__row"><span class="site-mini__accent"></span><span class="site-mini__ink"></span></span></span>')
        return (f'<label class="site-themecard"><input class="tray-vh" type="radio" name="site-theme-pick" value="{th["id"]}">'
                f'<span class="site-themecard__frame"><span class="site-themecard__view" data-theme="{th["id"]}">{mini}</span></span>'
                f'<span class="site-themecard__text"><b>{html.escape(th["name"])}</b><small>{"Dark" if th["mode"] == "dark" else "Light"}</small></span></label>')
    def well(key, label, hint):
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
        + well('page', 'Page', 'The ground. A pale page makes a light theme, a dark page a dark one.')
        + well('surface', 'Tray', 'Cards and the fill of controls. It follows the page until you set it.')
        + well('ink', 'Ink', 'Text. It needs 10:1 on the page and the tray.')
        + well('accent', 'Accent', 'The one loud colour. Ink text goes on it, so keep it bright.')
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
        # until the maker says whether the theme holds, a skeleton of what it will say, so nothing under it moves when it does
        '<div data-maker-verdict><div class="tray-alert site-sk" aria-hidden="true"><span class="tray-alert__icon site-sk-pill">' + icon('circle-check') + '</span>'
        '<div class="tray-alert__body"><p class="tray-alert__title"><span class="site-sk-ink">All the pairs hold their contrast</span></p><p class="tray-alert__text">'
        '<span class="site-sk-ink">Text keeps its contrast on every ground of this light theme, and ink reads on the accent.</span></p></div></div></div>'
        '<details class="tray-collapsible"><summary><span>Show every pair</span><span class="tray-tile" aria-hidden="true">' + icon('plus') + '</span></summary>'
        '<div class="tray-collapsible__body"><div class="tray-table-wrap"><table class="tray-table tray-table--compact"><thead><tr><th scope="col">What</th><th scope="col">Tokens</th>'
        '<th scope="col" data-num>Contrast</th><th scope="col" data-num>Needs</th><th scope="col">Holds</th></tr></thead><tbody data-maker-report></tbody></table></div></div></details>'
        '<h2 class="subtitle" id="themes-css">Take it with you</h2>'
        '<p>The theme is one rule. Save it as a stylesheet and link it after the system, or paste it into a stylesheet of your own, then name it on <code class="tray-code-inline">&lt;html&gt;</code>.</p>'
        '<div class="tray-code" dir="ltr"><div class="tray-code__head"><span>CSS</span><button class="tray-btn tray-btn--ghost tray-btn--xs" type="button" data-tray="copy" data-target="#site-theme-css">'
        + icon('copy', 'tray-icon--sm') + f'<span data-label>Copy</span></button></div><pre tabindex="0"><code id="site-theme-css">{colour(first_css, "css") if first_css else ""}</code></pre></div>'
        + code_block('<link rel="stylesheet" href="tokens.css">\n<link rel="stylesheet" href="components/bundle.css">\n<link rel="stylesheet" href="my-theme.css">', 'html', 'd-themes-code-2')
        + '<div class="tray-code" dir="ltr"><div class="tray-code__head"><span>HTML</span></div><pre tabindex="0"><code id="site-theme-html">' + colour('<html lang="en" data-theme="my-theme">', 'html') + '</code></pre></div>'
        '<p>Or send it as a link. Whoever opens it finds the theme here in the maker, checked the same way, and can wear it on this site with one press.</p>'
        '<div class="tray-code" dir="ltr"><div class="tray-code__head"><span>Link</span><button class="tray-btn tray-btn--ghost tray-btn--xs" type="button" data-tray="copy" data-target="#site-theme-link">'
        + icon('copy', 'tray-icon--sm') + '<span data-label>Copy</span></button></div><pre tabindex="0"><code id="site-theme-link"> </code></pre></div>'
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


def play_section(c, spec, drawn=None):
    """The playground under the example: the stage, the controls beside it, the markup under both. drawn: the playground at its
    first choice, as playground.js draws it (first()), so the page comes with it and keeps its length when the script arrives."""
    ident, width, drawn = c['id'], spec.get('width'), drawn or {}
    lead = spec.get('lead') or f'Choose how the {c["title"].lower()} looks and behaves, and copy its markup.'
    return (f'<section class="site-play" data-play="{ident}" aria-labelledby="{ident}-play"{f" style=\"--play-w: {width}\"" if width else ""}>'
            f'<div class="site-play__head"><h2 class="subtitle" id="{ident}-play">Playground</h2><p>{inline(lead)}</p></div>'
            f'<div class="site-play__box"><div class="site-play__stage" data-play-stage{" data-ground=" + chr(34) + drawn["ground"] + chr(34) if drawn else ""} role="group" aria-label="The example, as chosen">{drawn.get("stage", "")}</div>'
            f'<form class="tray-card site-play__controls" data-play-controls aria-label="Choices" autocomplete="off" novalidate>{drawn.get("controls", "")}</form></div>'
            f'<div class="tray-code" dir="ltr"><div class="tray-code__head"><span>HTML</span><button class="tray-btn tray-btn--ghost tray-btn--xs" type="button" data-tray="copy" data-target="#{ident}-play-code">'
            f'{icon("copy", "tray-icon--sm")}<span data-label>Copy</span></button></div><pre tabindex="0"><code id="{ident}-play-code" data-play-code>{colour(drawn["code"], "html") if drawn else ""}</code></pre></div></section>')


# What a page's own script draws when it opens, drawn while the site is built by the same script in node: the page comes with
# it, so nothing below it moves when the script arrives.
FIRST_DRAW = r"""
const [play, engine] = process.argv.slice(1);
const P = require(play), T = require(engine);
const input = JSON.parse(require('fs').readFileSync(0, 'utf8'));
const plays = {};
for (const name in input.plays) plays[name] = P.first(input.plays[name]);
const light = input.themes.list.find((t) => t.id === 'light');
process.stdout.write(JSON.stringify({ plays, css: T.css('my-theme', light.tokens, input.themes.themed, light.more) }));
"""


def first_draw(plays, themes):
    """Each playground at its first choice (playground.js) and the rule the theme maker starts from (theme.js): {plays, css}."""
    try:
        done = subprocess.run(['node', '-e', FIRST_DRAW, str(SRC / 'playground.js'), str(SRC / 'theme.js')], input=json.dumps({'plays': plays, 'themes': themes}),
                              capture_output=True, text=True, encoding='utf-8')
    except FileNotFoundError:
        sys.exit('site: node was not found; the playgrounds and the theme maker are drawn with it')
    if done.returncode:
        sys.exit('site: drawing the playgrounds in node failed:\n' + done.stderr)
    return json.loads(done.stdout)


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


def chart_card(c, group, level='h2', code=True):
    """One example, drawn live; on the page of its form its file follows, folded, so the page holds the code it shows."""
    name = f'{group["nav"]}: {c["title"]}' if group['id'] != 'ready' else f'Chart: {c["title"]}'
    src = (f'<details class="site-chart__code"><summary>{icon("code", "tray-icon--sm")}<span>Code</span><span class="tray-vh"> of {html.escape(name)}</span></summary>'
           + code_block(c['source'], 'tsx', f'ch-code-{c["id"]}') + '</details>') if code else ''
    return (f'<article class="site-chart{" site-chart--wide" if c.get("wide") else ""}"><div class="site-chart__bar"><div><{level} class="site-chart__name">{html.escape(c["title"])}</{level}>'
            f'<p>{html.escape(c["note"])}</p></div></div>'
            f'<div class="site-chart__view" data-rechart="{c["id"]}"></div>{src}</article>')


def opening_tag(src, name):
    """The attributes of the first <name ...> in a React file, braces and all, or None."""
    m = re.search(r'<' + name + r'(?![\w.])', src)
    if not m:
        return None
    depth, i = 0, m.end()
    while i < len(src):
        ch = src[i]
        if ch in '{':
            depth += 1
        elif ch == '}':
            depth -= 1
        elif ch == '>' and depth == 0:
            return src[m.end():i]
        i += 1
    return None


def chart_shape(source):
    """How an example lays out, read from its file: the head of its card, the title and caption of the chart, the height of
    the plot, the names in its key and whether the figures fold under it. None for one this cannot read: a plain Chart that
    is round, set beside its key or on its side."""
    box = opening_tag(source, 'ChartContainer')
    plain = opening_tag(source, 'Chart') if box is None else None
    if box is None and (plain is None or not re.search(r'type="(bar|line|area)"', plain) or re.search(r'(?<![\w.-])(horizontal|side)(?![\w=-])', plain)):
        return None
    def text(attrs, key):
        """A prop given as a string, or as a template whose ${…} parts stand in at about the length they print."""
        m = re.search(key + r'=(?:"([^"]*)"|\{`([^`]*)`\})', attrs or '')
        return re.sub(r'\$\{[^}]*\}', '0000', (m.group(1) or m.group(2) or '') if m else '')
    if plain is not None:  # the plain Chart: a key when it draws more than one series, the figures unless table={false}
        names = re.findall(r"name: '([^']*)'", plain)
        tall = re.search(r'height=\{(\d+)\}', plain)
        return {'head': None, 'title': text(plain, 'title'), 'caption': text(plain, 'caption'), 'plot': int(tall.group(1)) if tall else 192,
                'key': names if len(names) > 1 else [], 'figures': 'table={false}' not in plain}
    flag = lambda key: re.search(r'(?<![\w.-])' + key + r'(?![\w=-])', box) is not None
    tall = re.search(r'height=\{(\d+)\}', box)
    config = re.search(r'const config = \{(.*?)\}\s*satisfies', source, re.S)
    card = opening_tag(source, 'Card')
    items = re.search(r'items=\{(\w+)\}', card or '')  # the choices of a switch in the head of the card
    choices = re.search(r'const ' + items.group(1) + r' = \[(.*?)\];', source, re.S) if items else None
    return {'head': (text(card, 'title'), text(card, 'description'), re.findall(r"label: '([^']*)'", choices.group(1)) if choices else []) if text(card, 'title') else None,
            'title': text(box, 'title'), 'caption': text(box, 'caption'), 'plot': int(tall.group(1)) if tall else 224 if flag('round') else 192,
            'key': re.findall(r"label: '([^']*)'", config.group(1)) if config and flag('legend') else [], 'figures': 'footer=' in box}


def chart_skeleton(shape):
    """The card of a chart before charts.js draws it, laid out with the classes the chart is drawn with and its own words,
    hidden: it holds the chart's height at every width, and React takes its place in one step."""
    ink = lambda words: f'<span class="site-sk-ink">{html.escape(words) or "&nbsp;"}</span>'
    head = ''
    if shape['head']:
        title, about, choices = shape['head']
        head = (f'<div class="tray-card__head"><div><h3 class="subtitle">{ink(title)}</h3><p class="tray-soft">{ink(about)}</p></div>'
                + (f'<div class="tray-seg tray-seg--sm site-sk-pill">' + ''.join(f'<span class="tray-seg__item"><span>{html.escape(c)}</span></span>' for c in choices) + '</div>' if choices else '')
                + '</div>')
    return (f'<div class="tray-card site-sk" aria-hidden="true" inert>{head}<figure class="tray-chart">'
            + (f'<figcaption class="tray-chart__title">{ink(shape["title"])}</figcaption>' if shape['title'] else '')
            + (f'<p class="tray-chart__caption">{ink(shape["caption"])}</p>' if shape['caption'] else '')
            + f'<div class="tray-chart__canvas site-sk-area" style="--tray-h: {shape["plot"]}px"></div>'
            + ('<ul class="tray-chart__legend">' + ''.join(f'<li><span class="tray-swatch"></span>{ink(k)}</li>' for k in shape['key']) + '</ul>' if shape['key'] else '')
            + (f'<details class="tray-collapsible"><summary>{ink("Show the figures")}<span class="tray-tile site-sk-pill"></span></summary></details>' if shape['figures'] else '')
            + '</figure></div>')


# ---------- Skeletons: the shape of a page while its file is on its way ----------
# A page opened from another page comes in a file of its own. When that takes longer than a moment, site.js draws the page's
# skeleton: its title and summary as they will be, and grey shapes laid out with the page's own classes where the rest will
# come. index[id]['sk'] says what to draw, from the page as it was built: its kind, then what its first screens hold.

class Blocks(html.parser.HTMLParser):
    """The blocks directly inside the first element with a class (site-prose by default), with the length of their words."""
    VOID = {'br', 'img', 'input', 'meta', 'link', 'hr', 'source', 'wbr', 'col', 'use', 'path', 'rect', 'circle', 'line', 'polyline', 'polygon'}

    def __init__(self, cls='site-prose'):
        super().__init__(convert_charrefs=True)
        self.cls, self.depth, self.at, self.blocks, self.inline = cls, 0, None, [], 0

    def handle_starttag(self, tag, attrs):
        if tag in self.VOID:
            return
        cls = (dict(attrs).get('class') or '').split()
        self.depth += 1
        if self.at is None and self.cls in cls:
            self.at = self.depth
        elif self.at is not None and self.at > 0:
            if self.depth == self.at + 1:
                self.blocks.append({'tag': tag, 'cls': cls, 'text': 0, 'kids': 0, 'lines': 1, 'rows': 0, 'cols': 0})
            elif self.blocks and self.depth > self.at + 1:
                b = self.blocks[-1]
                b['kids'] += self.depth == self.at + 2
                b['rows'] += tag == 'tr'
                b['cols'] += tag in ('th', 'td') and b['rows'] == 1
                self.inline += 'tray-code-inline' in cls

    def handle_endtag(self, tag):
        if tag in self.VOID:
            return
        if self.at is not None and self.at > 0 and self.blocks and self.depth > self.at + 1 and self.inline:
            self.inline -= 1
        if self.at == self.depth:
            self.at = -1  # the first one only
        self.depth -= 1

    def handle_data(self, data):
        if self.at is not None and self.at > 0 and self.blocks and self.depth > self.at:
            b = self.blocks[-1]
            b['text'] += len(data.strip() and ' '.join(data.split())) * (1.3 if self.inline else 1)  # code is set wider than words
            b['lines'] += data.count('\n') if b['tag'] == 'div' and 'tray-code' in b['cls'] else 0


def outline(markup, cls='site-prose', most=9):
    """The first blocks of a column of words, as the skeleton draws them, in one string: h<len> a heading, i<len> a smaller
    one, p<len> a paragraph, l<items>:<len> a list, c<lines> a block of code, t<rows>:<cols>:<len> a table, d a fold, m<n> the list
    of themes. It stops at a block of any other kind: what the skeleton cannot draw it leaves out."""
    parser = Blocks(cls)
    parser.feed(markup)
    out = []
    for b in parser.blocks[:most]:
        n, tag, kind = round(b['text']), b['tag'], b['cls'][0] if b['cls'] else ''
        if tag == 'h2':
            out.append(f'h{n}')
        elif tag == 'h3':
            out.append(f'i{n}')
        elif tag == 'p' and 'tray-list__empty' not in b['cls']:
            out.append(f'p{n}')
        elif tag in ('ul', 'ol') and b['kids']:
            out.append(f'l{b["kids"]}:{round(n / b["kids"])}')
        elif kind == 'tray-code':
            out.append(f'c{max(1, b["lines"])}')
        elif kind == 'tray-table-wrap' and b['rows']:
            out.append(f't{b["rows"]}:{b["cols"] or 2}:{round(n / (b["rows"] * (b["cols"] or 2)))}')
        elif tag == 'details':
            out.append('d')
        elif kind == 'site-themelist':
            out.append(f'm{b["kids"]}')
        else:
            break
    return ' '.join(out)


def chart_code(shape):
    """A chart in the skeleton of a page, in a few letters: the height of its plot, k and the names in its key, f when its figures
    fold under it, h when its card has a head, n when it has no caption. '' for one the build cannot read."""
    if not shape:
        return ''
    return (f'{shape["plot"]}' + (f'k{len(shape["key"])}' if shape['key'] else '') + ('f' if shape['figures'] else '') + ('h' if shape['head'] else '')
            + ('n' if not shape['caption'] else ''))


def skeleton_of(ident, page, shapes):
    """What the skeleton of a page draws: its kind first, then what its kind needs. shape() in tools/site/site.js draws it."""
    def lens(pattern, part=page):
        return [len(' '.join(html.unescape(re.sub(r'<[^>]+>', '', m)).split())) for m in re.findall(pattern, part, re.S)]
    def charts(part):
        return [chart_code(shapes.get(i)) + ('w' if 'site-chart--wide' in a else '')
                for a, i in re.findall(r'<article class="(site-chart[^"]*)">.*?data-rechart="([a-z0-9-]+)"', part, re.S)]
    if ident == 'home':
        return ['home']
    if 'data-viewer=' in page:
        return ['b', outline(page)]
    stage = re.search(r'class="site-stage" style="min-block-size: (\d+)px"', page)
    if stage:
        # the controls of its playground, by kind: g segments, l a list, t a text, s a switch, r a slider
        form = re.search(r'data-play-controls[^>]*>(.*?)</form>', page, re.S)
        form = form.group(1) if form else ''
        kinds = ('g' * form.count('class="tray-seg ') + 'l' * form.count('<select') + 't' * form.count('class="tray-input')
                 + 's' * form.count('class="tray-switch"') + 'r' * form.count('class="tray-slider-field"'))
        code = re.search(r'data-play-code>(.*?)</code>', page, re.S)  # and the lines of its markup
        return ['c', int(stage.group(1)), kinds if 'data-play=' in page else '', outline(page), code.group(1).count('\n') + 1 if code else 0]
    if 'class="site-gallery"' in page:
        groups = re.findall(r'<h2 class="subtitle">(.*?)</h2><div class="site-gallery">(.*?)</div></section>', page, re.S)
        return ['g', outline(page), [[lens('(.*)', g)[0], cards.count('class="site-thumb"')] for g, cards in groups]]
    if 'class="site-groups"' in page:
        return ['i', [[lens('(.*)', g)[0], items.count('<li>')] for g, items in re.findall(r'<section class="tray-card site-group"><h2>(.*?)</h2><ul>(.*?)</ul>', page, re.S)]]
    if 'site-chartrow' in page:
        rows = re.findall(r'<section class="site-prose site-chartrow">(.*?)</section>', page, re.S)
        return ['o', outline(page), [[(lens(r'<h2 class="subtitle">(.*?)</h2>', r) or [12])[0], (lens(r'<div class="site-chartrow__head"><div>.*?<p>(.*?)</p>', r) or [60])[0], charts(r)]
                                     for r in rows]]
    if 'class="site-charts"' in page:
        return ['h', [list(x) for x in zip(lens(r'class="site-chart__name">(.*?)</h2>'), lens(r'<div class="site-chart__bar"><div><h2[^>]*>.*?</h2><p>(.*?)</p>'), charts(page))]]
    if 'class="site-articles"' in page:
        return ['l', int('site-lead' in page), page.count('class="tray-card tray-span-4"')]
    if 'class="site-post"' in page:
        crumbs = re.search(r'<ol class="tray-crumbs">(.*?)</ol>', page, re.S)
        return ['a', page.count('class="tray-sidebar__item"') // 2, outline(page), lens(r'<li>(.*?)</li>', crumbs.group(1)) if crumbs else [8, 12, 16]]
    return ['p', outline(page)]


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
    out += table('size', 'Sizes', 'The heights of controls. A control a finger must hit is at least the hit size tall; the <a href="#g-accessibility">accessibility guide</a> names the few that are smaller.',
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
    all_templates = read_templates()
    templates = [x for x in all_templates if not x['problems']]
    skipped += [f'templates/{x["name"]}.html: {"; ".join(x["problems"])}' for x in all_templates if x['problems']]
    strays = (sorted(set(SEARCH['components']) - {c['name'] for c in comps}) + sorted(set(SEARCH['blocks']) - {x['name'] for x in all_blocks})
              + sorted(f'block-notes/{f.name}' for f in (SRC / 'block-notes').glob('*.md') if f.stem not in {x['name'] for x in all_blocks}))
    if strays:
        sys.exit(f'tools/site/search.json or tools/site/block-notes/ names what the system does not have: {strays}')
    for c in comps:
        c['search'], c['also'] = SEARCH['components'].get(c['name'], [None, None])
    for x in blocks:
        about = SRC / 'block-notes' / f'{x["name"]}.md'
        x['about'] = about.read_text(encoding='utf-8').strip() if about.exists() else ''  # site_check asks for one on every block
    articles, topics = read_articles()
    chart_groups = read_charts()
    charts = [c for g in chart_groups for c in g['charts']]
    sizes = {f: len(gzip.compress((DIST / f).read_bytes(), 9)) for f in ('tokens.css', 'components/bundle.css', 'components/bundle.js')}
    site_url = LINKS.get('site', '').rstrip('/')
    facts = {'components': len(comps), 'blocks': len(blocks), 'icons': len(icons), 'charts': len(charts), 'version': VERSION,
             'tokens': sum(len(v['tokens']) for v in tok.values() if isinstance(v, dict) and 'tokens' in v), 'kb': round(sum(sizes.values()) / 1024),
             'tokens_kb': max(1, round(sizes['tokens.css'] / 1024)), 'css_kb': round(sizes['components/bundle.css'] / 1024), 'js_kb': round(sizes['components/bundle.js'] / 1024), 'zip': f'trayui-{VERSION}.zip',
             'repo': LINKS.get('repo', '') if PUBLIC else '', 'license': LINKS.get('license', ''), 'npm': NPM,
             # where the three files can be linked from: jsDelivr, by release, once the package is on npm or the repository is
             # open; until then this site
             'cdn': CDN, 'jsdelivr': CDN.startswith('https://cdn.jsdelivr.net/'),
             'site': site_url, 'author': LINKS.get('author', ''), 'author_url': LINKS.get('author_url', ''),
             'icon_wall': ''.join(icon(n) for n in sorted(icons)), 'themes': len(tok['color']['themes']),
             'theme_menu': theme_menu(theme_data(tok)['list']), 'mark': MARK, 'plays': len(plays), 'articles': len(articles), 'templates': len(templates)}
    count = stars(facts['repo']) if facts['repo'] else None
    facts['github'] = github_link(facts['repo'], count, 'tray-topbar__wide') if facts['repo'] else ''  # in the header, and in the sheet on a phone
    facts['github_sheet'] = github_link(facts['repo'], count) if facts['repo'] else ''
    at = site_url or facts['cdn'] or 'trayui'  # the home page's lines are short: the site's own copies of the current release; the docs give jsDelivr by version
    # the three ways in that the home page copies: the lines that link the files, from where they come, and a prompt that has
    # an agent set the system up in the project it works in (the agents page shows the same words)
    facts['install'] = html.escape(f'<link rel="stylesheet" href="{at}/tokens.css">\n<link rel="stylesheet" href="{at}/components/bundle.css">\n'
                                   f'<script defer src="{at}/components/bundle.js"></script>', quote=False)
    facts['install_from'] = urllib.parse.urlsplit(at).netloc or at
    facts['prompt'] = (f'Add Tray UI to this project. Read {site_url or "https://trayui.com"}/llms.txt first.\n'  # lines that fit the docs' code box
                       'Run npx trayui init, then npx trayui skill (add --agents if you are\n'
                       "not Claude Code), and follow the skill's SKILL.md.\n"
                       'In plain HTML, link tokens.css, components/bundle.css and\n'
                       'components/bundle.js on every page, in that order, with lang and\n'
                       'data-theme on <html>. With no shell, link them from the CDN that\n'
                       'llms.txt names.\n'
                       'Run npx trayui check on each page before you hand it over.')
    facts['prompt_html'] = html.escape(facts['prompt'], quote=False)

    def fill(text, more=None):
        """{{name}} in the site's own pages stands for a fact about this build; more holds the facts of one page."""
        known = dict(facts, **(more or {}))
        was = None
        while was != text:  # a section inside another is opened once the one around it is: go round until none is left
            was = text
            text = re.sub(r'\{\{#(\w+)\}\}(.*?)\{\{/\1\}\}', lambda m: m.group(2) if known.get(m.group(1)) else '', text, flags=re.S)
            text = re.sub(r'\{\{\^(\w+)\}\}(.*?)\{\{/\1\}\}', lambda m: '' if known.get(m.group(1)) else m.group(2), text, flags=re.S)
        text = re.sub(r'\{\{(\w+)\}\}', lambda m: str(known[m.group(1)]), text)
        left = re.search(r'\{\{[#^/]?\w+\}\}', text)
        if left:
            sys.exit(f'a mark of the templates is left unfilled: {left.group(0)} in ...{text[max(0, left.start() - 60):left.start()]}')
        return text

    # ---------- the docs section: the site's own pages, the foundations, the guides of the system ----------
    doc_names = [n for n in ('introduction', 'installation', 'cli', 'theming', 'react', 'tailwind-figma', 'from-tailwind', 'agents', 'skill') if (SRC / 'pages' / f'{n}.md').exists()]
    docs = [read_page(SRC / 'pages' / f'{n}.md', 'd-' + n, '') for n in doc_names]
    for d in docs:
        d['src'] = [f'system/tools/site/pages/{d["id"][2:]}.md']
    docs.append(dict(read_page(ROOT.parent / 'CHANGELOG.md', 'd-changelog', ''), src=['CHANGELOG.md']))  # the changelog of the repository, as a page of the site
    for d in docs:
        d['summary'], d['guide'] = fill(d['summary']), fill(d['guide'])
    themes = theme_data(tok)
    opening = first_draw(plays, themes)  # what the playgrounds and the theme maker show as they open
    docs.insert(next(i for i, d in enumerate(docs) if d['id'] == 'd-theming') + 1, {'id': 'd-themes', 'title': 'Themes', 'group': '', 'html': themes_page(themes, opening['css']), 'wide': True, 'src': ['system/project/tokens.json'],
                    'summary': f'{len(themes["list"])} themes to choose from, and a maker for your own: four colours in, a whole theme out.'})
    foundations = [{'id': 'f-colours', 'title': 'Colours', 'summary': f'The {len(tok["color"]["tokens"])} colour tokens in the Light and the Dark theme, and what each is for.', 'html': colours_page(tok)},
                   {'id': 'f-type', 'title': 'Typography', 'summary': 'The type styles of the system: one family, Onest, in two voices, and the size, line height and weight of every class.', 'html': type_page(tok)},
                   {'id': 'f-scale', 'title': 'Space and shape', 'summary': 'Space, corners, sizes, the one shadow and the rest of the scale: each a token, with its value and what it is for.', 'html': scale_page(tok)},
                   {'id': 'f-icons', 'title': 'Icons', 'summary': f'{len(icons)} icons from Lucide built in, ready to copy, and how to use any other.', 'html': icons_page(icons)}]
    for f in foundations:
        f['group'], f['src'] = 'Foundations', ['system/src/icons.json' if f['id'] == 'f-icons' else 'system/project/tokens.json']
    guides = []
    for f in sorted((P / 'guides').glob('*.md')):
        if f.stem in ('0-components', '5-blocks', '6-templates'):
            continue  # the three lists: this site is those lists
        guides.append(dict(read_page(f, 'g-' + re.sub(r'^\d+-', '', f.stem), 'Guides'), src=[f'system/project/guides/{f.name}']))
    brand = {'id': 'g-brand', 'title': 'The brand book', 'group': 'Guides', 'summary': 'The rules of the system in one page: content, colour, type, shape, layout, motion and icons.',
             'guide': (P / 'README.md').read_text(encoding='utf-8').strip(), 'src': ['system/project/README.md']}
    guides.insert(0, brand)

    def grouped(items, order):
        return [(g, [x for x in items if x['group'] == g]) for g in order if any(x['group'] == g for x in items)]
    entry = lambda x: {'id': x['id'], 'title': x['title']}
    sign_in = [x for x in blocks if x['group'] in ('Login', 'Signup')]
    sidebars = [x for x in blocks if x['group'] == 'Sidebar']
    doc_nav = [{'group': '', 'items': [entry(d) for d in docs]}, {'group': 'Foundations', 'items': [entry(f) for f in foundations]}, {'group': 'Guides', 'items': [entry(g) for g in guides]}]
    comp_nav = [{'group': '', 'items': [{'id': 'components', 'title': 'All components'}]}] + [{'group': g, 'items': [entry(c) for c in items]} for g, items in grouped(comps, GROUPS)]
    block_groups = grouped(blocks, BLOCK_GROUPS)
    block_nav = ([{'group': '', 'items': [{'id': 'blocks', 'title': 'All blocks'}, {'id': 'b-login', 'title': 'Sign-in and sign-up pages'}, {'id': 'b-sidebar', 'title': 'Sidebars'}]}]
                 + [{'group': g, 'items': [entry(x) for x in items]} for g, items in block_groups])
    template_groups = grouped(templates, TEMPLATE_GROUPS)
    template_nav = [{'group': '', 'items': [{'id': 'templates', 'title': 'All templates'}]}] + [{'group': g, 'items': [entry(x) for x in items]} for g, items in template_groups]
    chart_use = read_page(SRC / 'pages' / 'charts.md', 'ch-use', '')
    chart_use['summary'], chart_use['guide'] = fill(chart_use['summary']), fill(chart_use['guide'])
    for g in chart_groups:
        g['page'] = 'ch-' + g['id']
    forms, ready = [g for g in chart_groups if g['id'] != 'ready'], [g for g in chart_groups if g['id'] == 'ready']
    chart_nav = [{'group': '', 'items': [{'id': 'charts', 'title': 'All charts'}, entry(chart_use)]},
                 {'group': 'By form', 'items': [{'id': g['page'], 'title': g['nav']} for g in forms]},
                 {'group': 'Ready-made', 'items': [{'id': g['page'], 'title': g['nav']} for g in ready]}]
    # the pages of the Articles, for the search and the map of the site (the section shows no sidebar): the list, a page for
    # each topic, each with its later pages, then the articles topic by topic. A later page of a list is in the map of the
    # site, but not in the search (unlisted), where it would only repeat its list.
    def list_nav(owner, name, title, items):
        return [{'id': owner, 'title': name}] + [{'id': page_of_list(owner, n), 'title': f'{title}, page {n}', 'unlisted': 1} for n in range(2, len(paged(items)) + 1)]
    article_nav = ([{'group': '', 'items': list_nav('articles', 'All articles', 'Articles', articles) + [x for t in topics for x in list_nav(t['id'], t['title'], t['title'], t['articles'])]}]
                   + [{'group': t['name'], 'items': [{'id': a['id'], 'title': a['title']} for a in t['articles']]} for t in topics])  # whole titles: the search shows them
    sections = [{'id': 'docs', 'title': 'Docs', 'home': 'd-introduction', 'nav': doc_nav},
                {'id': 'components', 'title': 'Components', 'home': 'components', 'nav': comp_nav},
                {'id': 'blocks', 'title': 'Blocks', 'home': 'blocks', 'nav': block_nav},
                {'id': 'templates', 'title': 'Templates', 'home': 'templates', 'nav': template_nav},
                {'id': 'charts', 'title': 'Charts', 'home': 'charts', 'nav': chart_nav}]
    if articles:
        # No sidebar: the Articles page shows its topics as tabs and its articles as cards, and an article has its own contents.
        # No tab in the header either: the foot of every page links the Articles. Its list of pages still names every article
        # for the search and the map of the site.
        sections.append({'id': 'articles', 'title': 'Articles', 'home': 'articles', 'nav': article_nav, 'side': False, 'tab': False})

    # Where a page's content travels: 'pages/<id>' is a file of its own, loaded when the page is opened from another one,
    # so a visit loads only what it shows. data.js, loaded on every visit, holds only the map of the site.
    # mds holds every page as Markdown, and cards the picture a link to it shows.
    index, chunks, runs, mds, cards, srcs = {}, {'core': {}}, {}, {}, {}, {}

    def page(ident, title, group, section, body, summary='', md='', card=None, src=(), wide=False, **more):
        index[ident] = {'title': title, 'group': group, 'section': section, 'chunk': 'pages/' + ident, 'summary': summary, 'path': route(ident)}
        if wide:
            index[ident]['wide'] = 1
        chunks.setdefault('pages/' + ident, {})[ident] = dict({'html': body}, **more)
        mds[ident], cards[ident], srcs[ident] = md, dict(card or {}), list(src)

    def md_page(title, summary, body):
        body = re.sub(r'\A# [^\n]*\n', '', body.strip() + '\n').strip()  # a guide that brings its own title (the brand book) keeps the page's
        return f'# {title}\n\n{summary}\n\n{body}\n'

    # home: the landing page, with its facts filled in
    page('home', 'Tray UI', '', '', fill((SRC / 'home.html').read_text(encoding='utf-8')), 'A design system in plain HTML and CSS.', wide=True,
         card={'kind': 'home', 'title': f'{len(comps)} components in plain HTML and CSS', 'line': f'{len(blocks)} blocks, {len(icons)} icons and {len(themes["list"])} themes. Three files, no build step. MIT licence.'},
         src=['system/tools/site/home.html'])

    # docs
    start = ('<a class="tray-btn tray-btn--md" href="#d-installation">Get started</a>'
             '<a class="tray-btn tray-btn--quiet tray-btn--md" href="#components">Browse the components</a>')
    seq = docs + foundations + guides
    for i, p in enumerate(seq):
        prev, nxt = (seq[i - 1] if i else None), (seq[i + 1] if i + 1 < len(seq) else None)
        body = p.get('html') or f'<article class="site-prose">{markdown(p["guide"], p["id"])}</article>'
        kind = {'Foundations': 'Foundations', 'Guides': 'Guide'}.get(p['group'], 'Docs')
        page(p['id'], p['title'], p['group'], 'docs', head(p['title'], p['summary'], start if p['id'] == 'd-introduction' else '') + body + pager(prev, nxt), p['summary'],
             md=md_page(p['title'], p['summary'], p['guide']) if p.get('guide') else '', card={'kind': kind}, src=p['src'], wide=p.get('wide', False))

    # components: an index, then a page each
    cards_html = ''.join(
        f'<section class="tray-card site-group"><h2>{html.escape(g)}</h2><ul>' + ''.join(f'<li><a href="#{x["id"]}">{html.escape(x["title"])}</a></li>' for x in items) + '</ul></section>'
        for g, items in grouped(comps, GROUPS))
    order = [c for g in GROUPS for c in comps if c['group'] == g]
    comp_md = ''.join(f'## {g}\n\n' + ''.join(f'- [{x["title"]}](#{x["id"]}): {unmark(x["summary"])}\n' for x in items) + '\n' for g, items in grouped(comps, GROUPS))
    comp_summary = f'{len(comps)} components in plain HTML and CSS, with one small script for behaviour. Each has a page: a live example, its markup, and when to use it.'
    page('components', 'Components', '', 'components', head('Components', comp_summary) + f'<div class="site-groups">{cards_html}</div>' + pager(None, order[0]),
         f'All {len(comps)} Tray UI components in plain HTML and CSS, group by group, each with a live example, its markup and when to use it.', wide=True,
         md=md_page('Components', comp_summary, comp_md), card={'kind': 'Components'}, src=[f'system/project/components/{c["name"]}/README.md' for c in comps])
    for i, p in enumerate(order):
        prev, nxt = (order[i - 1] if i else {'id': 'components', 'title': 'All components'}), (order[i + 1] if i + 1 < len(order) else None)
        ident = p['id']
        example = (f'<section class="site-example" data-tray="tabs" aria-label="Example"><div class="site-viewer__bar"><div class="tray-tabs" role="tablist" aria-label="Example">'
                   f'<button class="tray-tab" role="tab" aria-selected="true" aria-controls="site-live" id="site-t1" type="button">Preview</button>'
                   f'<button class="tray-tab" role="tab" aria-controls="site-src" id="site-t2" type="button">Markup</button></div>'
                   f'<div class="site-viewer__tools"><button class="tray-btn tray-btn--quiet tray-btn--sm" type="button" data-tray="copy" data-target="#site-src-code">{icon("copy")}<span data-label>Copy the markup</span></button></div></div>'
                   f'<div class="tray-tabpanel" role="tabpanel" id="site-live" aria-labelledby="site-t1"><div class="site-stage" style="min-block-size: {p["height"]}px">{p["stage"]}</div></div>'
                   f'<div class="tray-tabpanel" role="tabpanel" id="site-src" aria-labelledby="site-t2" tabindex="0" hidden>{code_block(pretty(p["body"]), "html", "site-src-code")}</div></section>')
        spec = plays.get(p['name'])
        also = f' Also called {p["also"]}.' if p['also'] else ''  # the other names people search for it by
        title_line, _, readme_rest = p['readme'].partition('\n\n')
        lead_para, _, readme_body = readme_rest.partition('\n\n')
        page(ident, p['title'], p['group'], 'components',
             head(p['title'], p['summary'] + also) + example + (play_section(p, spec, opening['plays'].get(p['name'])) if spec else '') + f'<article class="site-prose">{markdown(p["guide"], ident)}</article>' + pager(prev, nxt),
             p['summary'], md=f'{title_line}\n\n{lead_para}{also}\n\n{readme_body}\n', card={'kind': 'Component', 'show': p['stage'], 'script': p['script'], 'width': p['width'] or 760},
             src=[f'system/project/components/{p["name"]}/README.md', f'system/project/components/{p["name"]}/preview.html'], **({'play': spec} if spec else {}))
        index[ident]['also'], index[ident]['search'] = p['also'], p['search']
        if p['script']:
            runs[ident] = p['script']

    # blocks: a gallery first, then a page each, shown live in a frame of its own
    block_md = lambda items: ''.join(f'## {g}\n\n' + ''.join(f'- [{x["title"]}](#{x["id"]}): {unmark(x["summary"])}\n' for x in its) + '\n' for g, its in items)
    lead = ('<p>A block is a composition, not a component: a dashboard, a sidebar in one of its variants, a sign-in page, a shop, an article. Open one to see it '
            'at desktop, tablet and phone width, in the theme you chose for this site, and to copy its code.</p>')
    summary = f'{len(blocks)} screens built from the components: copy one into a product and fill it. Each is a single page of plain HTML.'
    more = {'Login': 'b-login', 'Signup': 'b-login', 'Sidebar': 'b-sidebar'}
    seq = [{'id': 'blocks', 'title': 'All blocks'}] + blocks
    page('blocks', 'Blocks', '', 'blocks', gallery('Blocks', summary, block_groups, lead, more) + pager(None, seq[1]), summary, wide=True,
         md=md_page('Blocks', summary, block_md(block_groups)), card={'kind': 'Blocks'}, src=[f'system/project/blocks/{x["name"]}.html' for x in blocks])
    for ident, title, items, words in (
            ('b-login', 'Sign-in and sign-up pages', sign_in,
             f'{len(sign_in)} sign-in and sign-up pages in plain HTML and CSS: a card on the page, a form beside a cover or a picture, an email link, and other accounts first.'),
            ('b-sidebar', 'Sidebars', sidebars,
             f'{len(sidebars)} app sidebars in plain HTML and CSS: one level or two, sections that fold, a rail of icons, a file tree, a calendar and a sidebar on each side.')):
        groups = grouped(items, BLOCK_GROUPS)
        lead_ = ('<p>Each one is a whole page: open it to see it at desktop, tablet and phone width, and copy its code. Their forms carry labels and <code class="tray-code-inline">autocomplete</code>, '
                 'and a password can be shown before it is sent.</p>' if ident == 'b-login' else
                 '<p>Each one is a whole page with the sidebar in place: open it to see it at desktop, tablet and phone width, and copy its code. The current page is marked with '
                 '<code class="tray-code-inline">aria-current</code>, and sections that fold are the browser\'s own <code class="tray-code-inline">&lt;details&gt;</code>.</p>')
        page(ident, title, '', 'blocks', gallery(title, words, groups, lead_) + pager({'id': 'blocks', 'title': 'All blocks'}, items[0]), words, wide=True,
             md=md_page(title, words, block_md(groups)), card={'kind': 'Blocks'}, src=[f'system/project/blocks/{x["name"]}.html' for x in items])
    for i, x in enumerate(blocks, 1):
        parts = built_from(x['source'], comps)
        made = ', '.join(f'[{c["title"]}](#{c["id"]})' for c in parts)
        uses = ', '.join(f'`{b}`' for b in x['behaviours'])
        md = md_page(x['title'], x['summary'], (f'{x["about"]}\n\n' if x['about'] else '')
                     + (f'It is made of these components: {made}.\n\n' if made else '') + (f'Behaviours it uses: {uses}.\n\n' if uses else '')
                     + 'Copy the page into a project that links `tokens.css`, `components/bundle.css` and `components/bundle.js`; the paths in its `<head>` assume it sits one folder below them.\n\n'
                     + f'```html\n{x["source"].strip()}\n```')
        page(x['id'], x['title'], x['group'], 'blocks', head(x['title'], x['summary']) + viewer(x, parts, x['about']) + pager(seq[i - 1], seq[i + 1] if i + 1 < len(seq) else None),
             x['summary'], wide=True, md=md, card={'kind': 'Block', 'block': x['name']},
             src=[f'system/project/blocks/{x["name"]}.html'] + ([f'system/tools/site/block-notes/{x["name"]}.md'] if x['about'] else []), source=x['source'])
        index[x['id']]['search'] = SEARCH['blocks'].get(x['name'])

    # templates: a gallery first, then a page each, shown live in a frame of its own, as the blocks are
    summary = f'{len(templates)} whole pages of a product, with realistic content, built only from the components: copy one and make it yours.'
    lead = ('<p>A template is a finished page of a product: its public pages, the home screen, a list and one record, the inbox, settings, billing and the first-run wizard. '
            'Open one to see it at desktop, tablet and phone width, in the theme you chose for this site, and to copy its code. Their names, figures and quotes are invented: replace them. '
            'For a smaller part of a screen, start from the <a href="#blocks">blocks</a>.</p>')
    seq = [{'id': 'templates', 'title': 'All templates'}] + templates
    page('templates', 'Templates', '', 'templates', gallery('Templates', summary, template_groups, lead) + pager(None, seq[1]), summary, wide=True,
         md=md_page('Templates', summary, block_md(template_groups)), card={'kind': 'Templates'}, src=[f'system/project/templates/{x["name"]}.html' for x in templates])
    for i, x in enumerate(templates, 1):
        parts = built_from(x['source'], comps)
        made = ', '.join(f'[{c["title"]}](#{c["id"]})' for c in parts)
        uses = ', '.join(f'`{b}`' for b in x['behaviours'])
        md = md_page(x['title'], x['summary'], (f'It is made of these components: {made}.\n\n' if made else '') + (f'Behaviours it uses: {uses}.\n\n' if uses else '')
                     + 'Its names, figures and quotes are invented: replace them. Copy the page into a project that links `tokens.css`, `components/bundle.css` and '
                     '`components/bundle.js`; the paths in its `<head>` assume it sits one folder below them.\n\n'
                     + f'```html\n{x["source"].strip()}\n```')
        page(x['id'], x['title'], x['group'], 'templates', head(x['title'], x['summary']) + viewer(x, parts) + pager(seq[i - 1], seq[i + 1] if i + 1 < len(seq) else None),
             x['summary'], wide=True, md=md, card={'kind': 'Template', 'block': x['name']}, src=[f'system/project/templates/{x["name"]}.html'], source=x['source'])

    # charts: an overview with two of each form, how to use them, then a page for each form with every example drawn live
    count = lambda g: f'{len(g["charts"])} {g["title"].lower()}' if g['id'] != 'ready' else f'{len(g["charts"])} examples'
    lead = ('<section class="site-prose"><p>In React, a chart is a <a href="https://recharts.github.io">Recharts</a> chart inside the frame of this system: '
            'the package brings the title, the colours, the tooltip, the key and the table of figures, and the stylesheet restyles the marks. '
            'Each example is one file to copy; <a href="#ch-use">Using the charts</a> says how they are put together. Every figure here is invented.</p>'
            + code_block("npm install recharts", 'sh', 'charts-code-1') + '</section>')
    chart_summary = f'{len(charts)} charts for React, drawn with Recharts in the style of the system: area, bar, line, pie, radar and radial, in every theme.'
    over = head('Charts', chart_summary) + lead
    for g in chart_groups:
        some = [c for c in g['charts'] if not c.get('wide')][:2]
        over += (f'<section class="site-prose site-chartrow"><div class="site-chartrow__head"><div><h2 class="subtitle">{html.escape(g["title"])}</h2><p>{html.escape(g["summary"])}</p></div>'
                 f'<a class="tray-btn tray-btn--quiet tray-btn--sm" href="#{g["page"]}">All {count(g)}{icon("arrow-right", "tray-icon--flip")}</a></div>'
                 f'<div class="site-charts site-charts--pair">{"".join(chart_card(c, g, "h3", code=False) for c in some)}</div></section>')
    chart_seq = [{'id': 'charts', 'title': 'All charts'}, chart_use] + [{'id': g['page'], 'title': g['title']} for g in chart_groups]
    chart_files = lambda gs: [f'system/react/examples/charts/{c["id"]}.tsx' for g in gs for c in g['charts']] + ['system/react/examples/charts/charts.json']
    page('charts', 'Charts', '', 'charts', over + pager(None, chart_seq[1]),
         f'{len(charts)} React chart examples on Recharts: area, bar, line, pie, radar and radial, each one file to copy, with a key and a table of figures.', wide=True,
         md=md_page('Charts', chart_summary, ''.join(f'## [{g["title"]}](#{g["page"]})\n\n{g["summary"]}\n\n' + ''.join(f'- {c["title"]}: {c["note"]}\n' for c in g['charts']) + '\n' for g in chart_groups)),
         card={'kind': 'Charts'}, src=chart_files(chart_groups))
    page('ch-use', chart_use['title'], '', 'charts',
         head(chart_use['title'], chart_use['summary']) + f'<article class="site-prose">{markdown(chart_use["guide"], "ch-use")}</article>' + pager(chart_seq[0], chart_seq[2]), chart_use['summary'],
         md=md_page(chart_use['title'], chart_use['summary'], chart_use['guide']), card={'kind': 'Charts'}, src=['system/tools/site/pages/charts.md'])
    note = ('<article class="site-prose"><p>Each example is one React file: open <b>Code</b> under a chart and copy it into a project that has <code class="tray-code-inline">recharts</code> and '
            '<code class="tray-code-inline">trayui-react</code>. The names and the figures are invented: replace them. <a href="#ch-use">Using the charts</a> explains the parts.</p></article>')
    for i, g in enumerate(chart_groups, 2):
        group = 'Ready-made' if g['id'] == 'ready' else 'By form'
        body = head(g['title'], g['summary']) + f'<div class="site-charts">{"".join(chart_card(c, g) for c in g["charts"])}</div>' + note
        md = md_page(g['title'], g['summary'], 'Each example is one React file. It needs `recharts` and `trayui-react` (the React package of Tray UI: see [React](#d-react)). '
                     'The names and the figures are invented.\n\n' + ''.join(f'## {c["title"]}\n\n{c["note"]}\n\n```tsx\n{c["source"].strip()}\n```\n\n' for c in g['charts']))
        page(g['page'], g['title'], group, 'charts', body + pager(chart_seq[i - 1], chart_seq[i + 1] if i + 1 < len(chart_seq) else None), g['summary'], wide=True,
             md=md, card={'kind': 'Charts'}, src=chart_files([g]))

    # articles: how to build a part of an interface in plain HTML, CSS and JavaScript, worked through with the code of the system.
    # The list is laid out as the journal block lays out a journal (articles-01), and an article as the long read does (article-01), without its wide picture.
    if articles:
        esc, author, author_url = html.escape, facts['author'], facts['author_url']
        article_summary = 'How to build the parts of an interface in plain HTML, CSS and JavaScript, accessible from the start, worked through with the code of Tray UI.'
        art_seq = [{'id': 'articles', 'title': 'All articles'}] + articles
        when = lambda a: f'<time datetime="{a["published"]}">{day(a["published"])}</time>'
        about = lambda a: esc(unmark(a['summary']))  # plain words: a card is a link, and a link may not hold another
        thumb = lambda a, span='': f'<div class="site-thumb{" " + span if span else ""}">{a["art"]}</div>'
        numbers = ('No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine')

        def person(small=False, link=True):
            """The author as the blocks show one: initials in an avatar, the name, and what they do here."""
            if not author:
                return ''
            name = f'<a href="{esc(author_url)}">{esc(author)}</a>' if link and author_url else esc(author)
            return (f'<span class="tray-person"><span class="tray-avatar{" tray-avatar--sm" if small else ""}" aria-hidden="true">{"".join(w[0] for w in author.split()[:2]).upper()}</span>'
                    f'<span class="tray-person__text"><b>{name}</b><small>Maintains Tray UI</small></span></span>')

        def featured(a):
            return (f'<a class="tray-card site-lead" href="#{a["id"]}" aria-labelledby="art-lead"><div class="tray-bento">{thumb(a, "tray-span-7")}'
                    f'<div class="tray-feature tray-span-5"><div class="tray-row tray-row--sm"><span class="tray-badge">{esc(a["group"])}</span><span class="caption tray-muted">{when(a)}</span></div>'
                    f'<h2 class="title" id="art-lead">{esc(a["title"])}</h2><p>{about(a)}</p>'
                    f'<div class="tray-feature__end tray-row tray-row--between">{person(small=True, link=False)}'
                    f'<span class="tray-row tray-row--sm caption tray-muted">{icon("clock", "tray-icon--sm")}{a["minutes"]} minutes to read</span></div></div></div></a>')

        def teasers(items, key, level, threes=False):
            span = 'tray-span-6' if len(items) < 3 and not threes else 'tray-span-4'  # two to a row while there are two, then three; a later page keeps the threes of the pages before it
            return '<div class="tray-bento">' + ''.join(
                f'<a class="tray-card {span}" href="#{a["id"]}" aria-labelledby="{key}-{a["id"]}"><div class="tray-stack">{thumb(a)}'
                f'<div class="tray-row tray-row--sm"><span class="tray-badge">{esc(a["group"])}</span><span class="caption tray-muted">{when(a)}, {a["minutes"]} minutes</span></div>'
                f'<{level} class="subtitle" id="{key}-{a["id"]}">{esc(a["title"])}</{level}><p class="tray-soft">{about(a)}</p></div></a>' for a in items) + '</div>'

        # the list: a tab for every topic with its count, the newest article large, the others in a grid, then the feed.
        # All of them from /articles, and the articles of one topic from its own page, /articles/topics/<topic>; a list
        # longer than a page goes on at /articles/page/2 and /articles/topics/<topic>/page/2.
        follow = (f'<section class="tray-card tray-cta" aria-labelledby="art-follow"><div class="tray-cta__text"><h2 class="subtitle" id="art-follow">New articles in a feed</h2>'
                  f'<p class="tray-soft">Add the Atom feed to a feed reader, and each new article comes to you whole, with its code.</p></div>'
                  f'<div class="tray-cta__actions"><button class="tray-btn" type="button" data-tray="copy" data-target="#art-feed">{icon("copy")}<span data-label>Copy the feed address</span></button>'
                  f'<a class="tray-btn tray-btn--quiet" href="/articles/feed.xml">Open the feed</a><span id="art-feed" hidden>{facts["site"]}/articles/feed.xml</span></div></section>'
                  ) if facts['site'] else ''  # the feed is written only for a site with an address

        def pagination(owner, pages, n):
            """The pages of a list as the journal block shows them, with the Pagination component: the first, the last, the
            current one and one on each side of it, a gap for the rest, and Previous and Next. A step that leads nowhere is a
            disabled button, not a link with no address."""
            count = len(pages)
            shown = sorted({1, count, n - 1, n, n + 1} & set(range(1, count + 1)))
            shown = sorted(set(shown) | {k + 1 for a, k in zip(shown[1:], shown) if a - k == 2})  # a gap of one page shows the page

            def step(to, way, label):
                arrow = icon('chevron-left' if way == 'prev' else 'chevron-right', 'tray-icon--flip')
                if not to:
                    return f'<li><button class="tray-page tray-page--step" type="button" disabled aria-label="{label}">{arrow}</button></li>'
                return f'<li><a class="tray-page tray-page--step" href="#{page_of_list(owner, to)}" rel="{way}" aria-label="{label}">{arrow}</a></li>'
            out, last = [step(n - 1, 'prev', 'Previous page')], 0
            for k in shown:
                if k - last > 1:
                    out.append('<li><span class="tray-page tray-page--gap" aria-hidden="true">&hellip;</span></li>')
                out.append(f'<li><a class="tray-page" href="#{page_of_list(owner, k)}"' + (' aria-current="page"' if k == n else '') + f'>{k}</a></li>')
                last = k
            out.append(step(n + 1 if n < count else 0, 'next', 'Next page'))
            return f'<nav aria-label="Pages"><ul class="tray-pages">{"".join(out)}</ul></nav>'

        def listing(owner, pages, n):
            """Page n of a list: a tab for every topic with its count, the current one marked; on the first page the newest
            article large and the next ones in a grid, on a later page the grid alone; then where this page stands among
            the others, and the feed."""
            mark = lambda ident: (' aria-current="page"' if n == 1 else ' aria-current="true"') if ident == owner else ''  # a later page belongs to its tab, which links the first
            tabs = ('<nav class="tray-tabs" aria-label="Topics" data-tray="strip">'
                    f'<a class="tray-tab" href="#articles"{mark("articles")}>All<span class="tray-badge tray-badge--count">{len(articles)}</span></a>'
                    + ''.join(f'<a class="tray-tab" href="#{t["id"]}"{mark(t["id"])}>{esc(t["name"])}<span class="tray-badge tray-badge--count">{len(t["articles"])}</span></a>' for t in topics)
                    + '</nav>')
            items, total = pages[n - 1], sum(len(x) for x in pages)
            first = 1 + sum(len(x) for x in pages[:n - 1])
            if n == 1:
                rest = items[1:]
                said = numbers[len(rest)] if len(rest) < 10 else str(len(rest))
                more = (f'<section class="tray-stack tray-stack--lg" aria-labelledby="art-more"><div class="tray-stack tray-stack--sm"><h2 class="subtitle" id="art-more">More articles</h2>'
                        f'<p class="tray-soft">{said} more{" on this page" if len(pages) > 1 else ""}, newest first.</p></div>{teasers(rest, "art", "h3")}</section>') if rest else ''
                shown = featured(items[0]) + more
            else:
                shown = teasers(items, 'art', 'h2', threes=True)
            span = f'Articles {first} to {first + len(items) - 1}' if len(items) > 1 else f'Article {first}'  # the last page may hold one
            where = (f'<div class="tray-row tray-row--between site-articles__pages"><p class="caption tray-muted">{span} of {total}</p>'
                     f'{pagination(owner, pages, n)}</div>') if len(pages) > 1 else ''
            return f'<div class="site-articles">{tabs}{shown}{where}</div>{follow}'

        list_md = lambda items: ''.join(f'- [{a["title"]}](#{a["id"]}), {day(a["published"])}: {unmark(a["summary"])}\n' for a in items)

        def list_pages(owner, title, summary, items, before):
            """Every page of a list. The first keeps the title and the summary of the list; a later one is "<title>, page n",
            and says in its description which articles it holds. Each is canonical to itself, and is in the sitemap."""
            pages = paged(items)
            for n, its in enumerate(pages, 1):
                ident, name = page_of_list(owner, n), title if n == 1 else f'{title}, page {n}'
                first = 1 + sum(len(x) for x in pages[:n - 1])
                span = f'articles {first} to {first + len(its) - 1}' if len(its) > 1 else f'article {first}'
                others = ', '.join(f'[{k}](#{page_of_list(owner, k)})' for k in range(1, len(pages) + 1) if k != n)
                md = list_md(its) + (f'\nPage {n} of {len(pages)}, {span} of {len(items)}. The other pages: {others}.\n' if len(pages) > 1 else '')
                desc = summary if n == 1 else f'{span[:1].upper() + span[1:]} of {len(items)}, newest first, on page {n} of {len(pages)}. {summary}'
                page(ident, name, '', 'articles', head(name, summary) + listing(owner, pages, n) + (pager(*before) if n == 1 else ''), desc,
                     md=md_page(name, summary, md), card={'kind': 'Articles'}, src=['system/tools/site/articles/topics.json'] + [s for a in its for s in a['src']])

        list_pages('articles', 'Articles', article_summary, articles, (None, art_seq[1]))
        topic_of = {t['name']: t for t in topics}
        for t in topics:
            list_pages(t['id'], t['title'], t['summary'], t['articles'], ({'id': 'articles', 'title': 'All articles'}, t['articles'][0]))

        # an article: the way back, its head with who wrote it, when and for how long, its contents beside it, then the pages it uses and a way to share it
        for i, a in enumerate(articles, 1):
            marks = [c[2] for c in a['contents']]
            taken = [m for m in marks if marks.count(m) > 1 or m in index or m.startswith(('site-', 'tray-', 'art-'))]  # a page's id, or one the site or the system uses
            if taken:
                sys.exit(f'tools/site/articles/{a["id"][2:]}.md: these headings make an id that is taken: {sorted(set(taken))}')
            a['prose'] = markdown(a['guide'], a['id'], anchors=True)  # also the content of its entry in the feed
            links, subs = '', ''
            for level, words, mark in a['contents'] + [(2, '', '')]:  # the last, empty, closes a list of h3s still open
                if level == 3:
                    subs += f'<li><a class="tray-sidebar__item" href="#{mark}">{esc(unmark(words))}</a></li>'
                    continue
                links += (f'<ul class="tray-sidebar__sub tray-sidebar__sub--text">{subs}</ul>' if subs else '') + (f'<a class="tray-sidebar__item" href="#{mark}"><span>{esc(unmark(words))}</span></a>' if mark else '')
                subs = ''
            # beside the article on a wide screen, folded above it on a narrow one: one or the other is shown
            side = (f'<nav class="tray-sidebar tray-sidebar--plain site-toc" aria-label="Contents" data-anchors><div class="tray-sidebar__group">'
                    f'<p class="tray-sidebar__label">Contents</p>{links}</div></nav>')
            fold = (f'<details class="tray-collapsible site-toc-fold"><summary><span>Contents</span><span class="tray-tile" aria-hidden="true">{icon("plus")}</span></summary>'
                    f'<nav class="tray-sidebar tray-sidebar--plain tray-collapsible__body" aria-label="Contents" data-anchors><div class="tray-sidebar__group">{links}</div></nav></details>')
            meta = (f'<div class="tray-row site-post__meta">{person()}<span class="tray-badge">{esc(a["group"])}</span>'
                    f'<span class="tray-row tray-row--sm caption tray-muted">{icon("calendar", "tray-icon--sm")}{when(a)}</span>'
                    f'<span class="tray-row tray-row--sm caption tray-muted">{icon("clock", "tray-icon--sm")}{a["minutes"]} minutes to read</span></div>')
            used = [u for u in dict.fromkeys(re.findall(r'\]\(#([a-z0-9-]+)\)', a['guide'])) if u in index and not u.startswith(('a-', 'at-', 'ap-', 'atp-')) and u != 'articles']  # the pages of the system it links to, in its order
            link = f'{facts["site"]}/{route(a["id"])}'
            foot = (('<div><dt>In Tray UI</dt><dd>' + ''.join(f'<a class="tray-btn tray-btn--quiet tray-btn--sm" href="#{u}">{esc(index[u]["title"])}</a>' for u in used) + '</dd></div>' if used else '')
                    + (f'<div><dt>Share</dt><dd><button class="tray-btn tray-btn--quiet tray-btn--sm" type="button" data-tray="copy" data-target="#art-link">{icon("link")}<span data-label>Copy the link</span></button>'
                       f'<a class="tray-btn tray-btn--quiet tray-btn--sm" href="mailto:?subject={urllib.parse.quote(a["title"])}&amp;body={urllib.parse.quote(link, safe="")}">{icon("mail")}Send by email</a>'
                       f'<span id="art-link" hidden>{link}</span></dd></div>' if facts['site'] else ''))
            page(a['id'], a['title'], a['group'], 'articles',
                 f'<article class="site-post" aria-labelledby="art-title"><header class="site-post__head"><nav aria-label="Breadcrumb"><ol class="tray-crumbs"><li><a href="#articles">Articles</a></li>'
                 f'<li><a href="#{topic_of[a["group"]]["id"]}">{esc(a["group"])}</a></li><li><span aria-current="page">{esc(a["nav"])}</span></li></ol></nav>'
                 f'<div class="site-post__words"><h1 class="headline" id="art-title" tabindex="-1">{esc(a["title"])}</h1><p class="lead tray-soft">{inline(a["summary"])}</p></div>{meta}</header>'
                 f'<div class="site-post__body">{side}<div class="site-post__main">{fold}<div class="site-prose">{a["prose"]}</div>'
                 + (f'<footer class="site-post__foot"><dl class="tray-dl tray-dl--stack">{foot}</dl></footer>' if foot else '') + '</div></div></article>'
                 + pager(art_seq[i - 1], art_seq[i + 1] if i + 1 < len(art_seq) else None),
                 a['summary'], md=md_page(a['title'], a['summary'], (f'By {facts["author"]}, ' if facts['author'] else '') + f'{day(a["published"])}.\n\n{a["guide"]}'),
                 card={'kind': 'Article', 'art': a['art']}, src=a['src'])  # its card shows its picture
            index[a['id']]['published'] = a['published']

    # the foundations and the themes have no Markdown source: their tables, written out
    cell = lambda s: str(s).replace('|', '\\|').replace('\n', ' ')
    pick = lambda t, th: t['value'] if isinstance(t['value'], str) else t['value'].get(th, list(t['value'].values())[0])
    light, dark = tok['color']['themes'][0]['id'], tok['color']['themes'][1]['id']
    mds['f-colours'] = md_page('Colours', foundations[0]['summary'], '| Token | Light | Dark | Use |\n| --- | --- | --- | --- |\n' + ''.join(
        f'| `--{t["name"]}` | `{cell(css_value(pick(t, light)))}` | `{cell(css_value(pick(t, dark)))}` | {cell(t.get("usage", ""))} |\n' for t in tok['color']['tokens'])
        + f'\n[Themes](#d-themes) lists the other {len(tok["color"]["themes"]) - 2} themes, which give the same tokens other values.')
    mds['f-type'] = md_page('Typography', foundations[1]['summary'], ''.join(
        f'## {g["name"]}\n\n| Class | Size | Line height | Weight | Tracking |\n| --- | --- | --- | --- | --- |\n'
        + ''.join(f'| `.{s["name"]}` | {s["fontSize"]} | {s["lineHeight"]} | {s["fontWeight"]} | {s.get("letterSpacing", "")} |\n' for s in g['styles']) + '\n' for g in tok['type']['groups'])
        + '## Families\n\n' + ''.join(f'- `--font-{k}`: {v}\n' for k, v in tok['type']['families'].items()))
    mds['f-scale'] = md_page('Space and shape', foundations[2]['summary'], ''.join(
        f'## {key[:1].upper() + key[1:]}\n\n| Token | Value | Use |\n| --- | --- | --- |\n'
        + ''.join(f'| `--{t["name"]}` | `{cell(t["value"] if isinstance(t["value"], str) else list(t["value"].values())[0])}` | {cell(t.get("usage", ""))} |\n' for t in tok[key]['tokens']) + '\n'
        for key in ('spacing', 'radius', 'size', 'layout', 'shadow', 'fluid', 'timing', 'zIndex', 'breakpoint', 'opacity') if key in tok))
    mds['f-icons'] = md_page('Icons', foundations[3]['summary'], 'Use one by its name: `<svg class="tray-icon" aria-hidden="true"><use href="#tray-i-truck"/></svg>`. '
                             'The script adds the sprite. `tray-icon--sm` is 16px, `tray-icon--lg` 28px, `tray-icon--flip` mirrors an icon in right-to-left pages.\n\n'
                             + '```text\n' + '\n'.join(sorted(icons)) + '\n```')
    mds['d-themes'] = md_page('Themes', docs[3]['summary'], 'Name a theme on `<html>`, or on any element to theme only what is inside it: `<html lang="en" data-theme="mint">`.\n\n'
                              + ''.join(f'- `{t["id"]}`: {t["name"]}, {t["mode"]}\n' for t in themes['list'])
                              + '\nThe page on the site has a maker: four colours in (the page, the tray, the ink and the accent), a whole theme out, checked for contrast.')

    # ---------- addresses: one for each page, and every link between pages by its address ----------
    taken = {}
    for ident, meta in index.items():
        if meta['path'] in taken:
            sys.exit(f'two pages have the address /{meta["path"]}: {taken[meta["path"]]} and {ident}')
        taken[meta['path']] = ident
    by_id = {sec['id']: sec for sec in sections}
    written = [(f'tools/site/block-notes/{x["name"]}.md', x['about']) for x in blocks] + [(f'tools/site/articles/{a["id"][2:]}.md', a['summary'] + a['guide']) for a in articles]
    dead = [f'{where} links #{m}' for where, text in written for m in re.findall(r'\]\(#([a-z0-9-]+)\)', text) if m not in index]
    if dead:
        sys.exit('links to pages the site does not have:\n  ' + '\n  '.join(dead))

    # ---------- what each page says about itself: its title and description in a search, its picture, its place ----------
    HEADS = {'home': 'Tray UI: a design system in plain HTML and CSS',
             'components': f'All {len(comps)} components in plain HTML and CSS - Tray UI', 'blocks': f'{len(blocks)} page blocks in plain HTML and CSS - Tray UI',
             'charts': f'{len(charts)} React chart examples with Recharts - Tray UI', 'b-login': 'Sign-in and sign-up pages in HTML and CSS - Tray UI',
             'b-sidebar': 'Sidebar layouts in HTML and CSS - Tray UI', 'd-introduction': 'Tray UI docs: an introduction to the design system',
             'd-installation': 'Install Tray UI: link three files, no build step', 'd-cli': 'Add Tray UI with a CLI: npx trayui init, add, check',
             'd-changelog': 'Tray UI changelog: what changed in each version',
             'd-from-tailwind': 'Coming from Tailwind: a plain CSS alternative - Tray UI', 'd-agents': 'Tray UI for AI agents: a skill, llms.txt and Markdown',
             'd-skill': 'The Tray UI skill for AI agents: install, rules, checker',
             'd-react': 'Tray UI in React: typed components and charts', 'd-themes': f'{len(themes["list"])} themes and a theme maker - Tray UI',
             'd-theming': 'Theming with CSS custom properties - Tray UI', 'f-type': 'Typography: type styles and the Onest font - Tray UI',
             'f-colours': 'Colour tokens in the light and dark theme - Tray UI', 'f-icons': f'{len(icons)} Lucide icons, built in - Tray UI',
             'g-accessibility': 'Accessibility: WCAG 2.2 AA in every theme - Tray UI', 'ch-use': 'Using the charts in React - Tray UI',
             'articles': 'Articles on HTML, CSS and accessibility - Tray UI', 'templates': f'{len(templates)} page templates built from the components - Tray UI'}
    TAILS = {'components': 'A Tray UI component in plain HTML and CSS.', 'blocks': 'A Tray UI block in plain HTML and CSS, to copy.', 'charts': 'React and Recharts, from Tray UI.',
             'templates': 'A Tray UI page template, built from its components.'}
    home_desc = (f'Tray UI is a design system in plain HTML and CSS: {len(comps)} components, {len(blocks)} blocks and {len(icons)} icons, in {len(themes["list"])} themes. '
                 'Three files, no framework, no build step.')
    seen = {}
    for ident, meta in index.items():
        t, name = meta['title'], meta.get('search') or meta['title']  # the name people search with comes first in the title
        if ident in HEADS:
            options = [HEADS[ident]]
        elif ident.startswith('c-'):
            options = [f'{name}: HTML and CSS component - Tray UI', f'{name}: HTML and CSS - Tray UI', f'{name} - Tray UI']
        elif ident.startswith('b-'):
            options = [f'{name}: HTML and CSS block - Tray UI', f'{name} in HTML and CSS - Tray UI', f'{name}: HTML block - Tray UI', f'{name} - Tray UI']
        elif ident.startswith('t-'):
            options = [f'{name} template in HTML and CSS - Tray UI', f'{name} template - Tray UI']
        elif ident.startswith('ch-'):
            options = [f'{t} in React with Recharts - Tray UI']
        elif ident.startswith('a-'):
            options = [f'{t} - Tray UI', t]  # an article's title is already the phrase people search
        else:
            options = []
        meta['head'] = next((o for o in options if len(o) <= 60), options[-1] if options else f'{t} - Tray UI')
        if meta['head'] in seen:
            sys.exit(f'two pages have the title "{meta["head"]}": {seen[meta["head"]]} and {ident}')
        seen[meta['head']] = ident
        own_home = ident == (by_id[meta['section']]['home'] if meta['section'] else 'home')
        tail = '' if own_home else TAILS.get(meta['section'], '')
        said = f'{meta["summary"]} Also called {meta["also"]}.' if meta.get('also') else ''
        meta['desc'] = (home_desc if ident == 'home' else fit(said, tail) if said and len(unmark(said)) <= 160
                        else fit(meta['summary'], tail))

    dates = git_dates()
    for ident, meta in index.items():
        found = [dates[s] for s in srcs[ident] if s in dates]
        if found or meta.get('published'):
            meta['lastmod'] = max(found + ([meta['published']] if meta.get('published') else []))  # an article not yet committed: the day it came out

    # every chart's place holds the skeleton of its card until charts.js draws it there
    shapes = {c['id']: chart_shape(c['source']) for c in charts}
    for pages_ in chunks.values():
        for p in pages_.values():
            p['html'] = re.sub(r'(<div class="site-chart__view" data-rechart="([a-z0-9-]+)">)(</div>)',
                               lambda m: m.group(1) + (chart_skeleton(shapes[m.group(2)]) if shapes.get(m.group(2)) else '') + m.group(3), p['html'])

    # every link between pages by its address, in the pages and in the theme menu
    for pages_ in chunks.values():
        for p in pages_.values():
            p['html'] = addressed(p['html'], index)
    facts['theme_menu'] = addressed(facts['theme_menu'], index)

    def foot(ident):
        """The foot of every page but the home page, which has a footer of its own: what this is, and its licence."""
        md = f'/{route(ident)}.md'
        source = ''
        if facts['repo'] and ident.startswith('c-'):
            name = next(c['name'] for c in comps if c['id'] == ident)
            source = f'<li><a href="{facts["repo"]}/blob/main/system/project/components/{name}/README.md">Source of this page</a></li>'
        return (f'<footer class="site-foot"><p>Tray UI {VERSION}, a design system in plain HTML and CSS, released under the {facts["license"]} licence.</p>'
                '<ul class="tray-footer__legal">' + ('<li><a href="/articles">Articles</a></li>' if articles else '') + '<li><a href="/docs/changelog">Changelog</a></li>'
                f'<li><a href="{md}">This page in Markdown</a></li><li><a href="/llms.txt">llms.txt</a></li>{source}</ul></footer>')
    for ident in index:
        if ident != 'home':
            chunks['pages/' + ident][ident]['html'] += foot(ident)

    def pills(markup):
        """A bar of the page for a skeleton: its controls grey pills of their own size, with nothing to follow or name."""
        markup = re.sub(r'\s(?:id|for|aria-controls|aria-labelledby|aria-selected|aria-current|data-tray|data-target|data-full|href)="[^"]*"', '', markup)
        return re.sub(r'class="(tray-tabs|tray-btn|tray-seg)\b', r'class="\1 site-sk-pill', markup)

    # the skeleton of every page, its summary as its head shows it (when that differs from its description), and the buttons
    # of its head; and the bars that the skeletons copy, controls turned into grey pills of their own size
    for ident, meta in index.items():
        built = chunks['pages/' + ident][ident]['html']
        meta['sk'] = skeleton_of(ident, built, shapes)
        if ident == 'home':
            continue
        lead = re.search(r'<div class="tray-pagehead__text"><h1[^>]*>.*?</h1><p>(.*?)</p></div>', built, re.S) or re.search(r'<p class="lead tray-soft">(.*?)</p>', built, re.S)
        if lead and (re.search(r'<[a-z]', lead.group(1)) or html.unescape(lead.group(1)) != meta['desc']):
            words = html.unescape(lead.group(1))
            # the summary is most often the start of the description (which adds a sentence to it): then its length is enough
            meta['lead'] = len(words) if not re.search(r'<[a-z]', lead.group(1)) and meta['desc'].startswith(words) else lead.group(1)
        acts = re.search(r'<div class="tray-pagehead__actions">(.*?)</div></div></div>', built, re.S)
        if acts:
            meta['acts'] = pills(acts.group(1))
    def part(ident, start, stop):
        built = chunks['pages/' + ident][ident]['html']
        at = built.find(start)
        return pills(built[at:built.index(stop, at)]) if at >= 0 else ''
    parts = {'example': part(next(i for i in index if i.startswith('c-')), '<div class="site-viewer__bar">', '<div class="tray-tabpanel"'),
             'viewer': part(next(i for i in index if i.startswith('b-') and 'data-viewer=' in chunks['pages/' + i][i]['html']), '<div class="site-viewer__bar">', '<div class="tray-tabpanel"'),
             'topics': part('articles', '<nav class="tray-tabs" aria-label="Topics"', '</nav>') + '</nav>' if 'articles' in index else '',
             'theme': re.sub(r'<b>([^<]*)</b><small>([^<]*)</small>', r'<b><span class="site-sk-ink">\1</span></b><small><span class="site-sk-ink">\2</span></small>',
                             re.sub(r'<input[^>]*>| data-theme="[^"]*"', '', part('d-themes', '<label class="site-themecard">', '</label>'))
                             .replace('class="site-themecard__frame"', 'class="site-themecard__frame site-sk-pill"')) + '</label>'}

    # ---------- write the site ----------
    if OUT.exists():
        shutil.rmtree(OUT)
    (OUT / 'components').mkdir(parents=True)
    (OUT / 'fonts').mkdir()
    for rel in ('tokens.css', 'components/bundle.css', 'components/bundle.js'):  # at their plain addresses, for other sites to link
        shutil.copyfile(DIST / rel, OUT / rel)
    for f in (DIST / 'fonts').iterdir():
        shutil.copyfile(f, OUT / 'fonts' / f.name)
    for folder in ('tailwind', 'figma'):  # the tokens for other tools, to link and download from the Tailwind and Figma page
        if (DIST / folder).exists():
            shutil.copytree(DIST / folder, OUT / folder)
    shutil.copytree(P / 'assets' / 'Media', OUT / 'assets' / 'Media')  # the pictures and the film of the Lightbox and Video Player previews
    shutil.copyfile(SRC / '_headers', OUT / '_headers')  # read by the host (Cloudflare Workers), not served

    files = {}

    def own(rel, data):
        """A file of the site's own, written to _/ with a hash of its content in its name."""
        b = data if isinstance(data, bytes) else data.encode('utf-8')
        stem, ext = rel.rsplit('.', 1)
        name = f'_/{stem}.{hashlib.sha256(b).hexdigest()[:10]}.{ext}'
        (OUT / name).parent.mkdir(parents=True, exist_ok=True)
        (OUT / name).write_bytes(b)
        files[rel] = name
        return name
    # the site's own copies of the three files; from _/ the font is one folder up
    own('tokens.css', re.sub(r'url\((["\']?)fonts/', r'url(\1../fonts/', (DIST / 'tokens.css').read_text(encoding='utf-8')))
    for rel in ('components/bundle.css', 'components/bundle.js'):
        own(rel, (DIST / rel).read_bytes())
    for name in ('site.css', 'site.js', 'theme.js', 'themes.js', 'playground.js'):
        own(name, (SRC / name).read_bytes())

    dump = lambda o: json.dumps(o, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
    for name, pages_ in chunks.items():
        if name == 'core':
            continue
        own_runs = [i for i in pages_ if i in runs]  # the preview scripts of the page in this file
        for i, p in pages_.items():
            p.pop('wide', None)
        tail = 'window.TRAY_SITE.add(' + json.dumps(name) + ', ' + dump({'pages': pages_}) + (
            ', {\n' + ',\n'.join(f'  {json.dumps(i)}: function () {{\n{runs[i]}\n  }}' for i in own_runs) + '\n}' if own_runs else '') + ');\n'
        f = own(name + '.js', f'/* Generated by tools/site.py: the page {name[6:]}, loaded when it is opened from another page. */\n' + tail)
        for i, p in pages_.items():
            index[i]['file'] = f
            if set(p) == {'html'} and i not in runs:
                index[i]['bare'] = 1  # drawn in its file, the page needs nothing more to work

    colour.close()
    bundled = bundle_charts(OUT / 'charts.js')  # charts.js and, beside it, the licences of what it holds
    bundled_code = bundle_code(OUT / 'code.js')  # code.js and its licence
    for name in ('charts.js', 'code.js'):
        own(name, (OUT / name).read_bytes())
        (OUT / name).unlink()

    # the picture a link to each page shows
    blocks_src = {x['name']: x['source'] for x in blocks + templates}  # a template's name is a word, a block's ends in its number: none is both
    assert len(blocks_src) == len(blocks) + len(templates), 'a template and a block have the same name'
    todo = []
    for ident, meta in index.items():
        card = dict(cards[ident], path=meta['path'])
        card.setdefault('title', meta['title'])
        if card.get('kind') != 'home':
            line = unmark(meta['summary'])
            card['line'] = line if len(line) <= 160 else line[:line.rfind(' ', 0, 158)] + '…'  # og.py shows four lines of it at most
        todo.append(card)
    pictures, said = og.make(todo, OUT, blocks_src)
    for meta in index.values():
        if meta['path'] in pictures:
            meta['og'] = pictures[meta['path']]

    def graph(ident, meta, sec):
        """The page in schema.org terms, for search engines: the site, the code and its author on the home page; elsewhere
        the page as a technical article and its place in the site as a trail of links."""
        site = facts['site']
        author = {'@type': 'Person', '@id': f'{site}/#author', 'name': facts['author'], 'url': facts['author_url']}
        website = {'@type': 'WebSite', '@id': f'{site}/#website', 'url': f'{site}/', 'name': 'Tray UI', 'description': 'A design system in plain HTML and CSS.', 'inLanguage': 'en'}
        if ident == 'home':
            code = {'@type': 'SoftwareSourceCode', '@id': f'{site}/#code', 'name': 'Tray UI', 'description': meta['desc'], 'version': VERSION,
                    'license': 'https://opensource.org/licenses/MIT', 'programmingLanguage': ['HTML', 'CSS', 'JavaScript'], 'runtimePlatform': 'Web',
                    'author': {'@id': f'{site}/#author'}, 'isPartOf': {'@id': f'{site}/#website'}}
            if facts['repo']:
                code['codeRepository'] = facts['repo']
            nodes = [dict(website, publisher={'@id': f'{site}/#author'}), code, author]
        else:
            url, top = f'{site}/{meta["path"]}', sec['home']
            trail = [{'@type': 'ListItem', 'position': 1, 'name': 'Tray UI', 'item': f'{site}/'}]
            if ident == top:
                trail.append({'@type': 'ListItem', 'position': 2, 'name': sec['title']})
            else:
                trail += [{'@type': 'ListItem', 'position': 2, 'name': sec['title'], 'item': f'{site}/{route(top)}'}, {'@type': 'ListItem', 'position': 3, 'name': meta['title']}]
            nodes = [{'@type': 'BreadcrumbList', 'itemListElement': trail}]
            if ident != top:
                # a page of the docs is a technical article; an article of the Articles section is an article, with the day it came out
                article = {'@type': 'Article' if meta.get('published') else 'TechArticle', 'headline': meta['title'], 'description': meta['desc'], 'url': url,
                           'mainEntityOfPage': url, 'inLanguage': 'en',
                           'isPartOf': {'@type': 'WebSite', '@id': f'{site}/#website', 'name': 'Tray UI', 'url': f'{site}/'},
                           'author': {'@type': 'Person', 'name': facts['author'], 'url': facts['author_url']}}
                if meta.get('og'):
                    article['image'] = f'{site}/{meta["og"]}'
                if meta.get('published'):
                    article['datePublished'] = meta['published']
                    article['publisher'] = {'@type': 'Person', 'name': facts['author'], 'url': facts['author_url']}
                if meta.get('lastmod') or meta.get('published'):
                    article['dateModified'] = max(d for d in (meta.get('lastmod'), meta.get('published')) if d)
                nodes.insert(0, article)
        return dump({'@context': 'https://schema.org', '@graph': nodes})

    # data.js: the map of the site, and the names its files are served at
    slim = {i: {k: v for k, v in m.items() if k not in ('summary', 'group', 'lastmod', 'also', 'search', 'published')} for i, m in index.items()}
    data = own('data.js', '/* Generated by tools/site.py: the map of the site and the names of its files. */\n'
               'window.TRAY_SITE = ' + dump({'version': VERSION, 'site': facts['site'], 'files': files, 'sections': sections, 'index': slim,
                                             'pages': {}, 'themes': themes, 'parts': parts}) + ';\nwindow.TRAY_SITE.run = {};\n')

    # Every page in a file of its own, drawn in it, so a link straight to a page shows it before any script runs; site.js
    # keeps what it finds and only wires it. The host serves components/lightbox.html at /components/lightbox. index.html is
    # the home page, and also the whole site where pages go by hash (framed inside another page): it links its
    # files from where it stands, every other page from the root.
    template = (SRC / 'index.html').read_text(encoding='utf-8')
    hashed = json.dumps({i: index[i]['file'] for i in index if i != 'home'}, separators=(',', ':'))
    asset = {'f_tokens': files['tokens.css'], 'f_bundle_css': files['components/bundle.css'], 'f_bundle_js': files['components/bundle.js'],
             'f_site_css': files['site.css'], 'f_site_js': files['site.js'], 'f_data': data}

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
        url = f'{facts["site"]}/{meta["path"]}' if facts['site'] else ''
        one = dict(asset, home=home, root='' if home else '/', route=meta['path'], page_id=ident, section=sec['id'] if sec else '',
                   page_title=html.escape(meta['head']), og_title=html.escape('Tray UI' if home else meta['title']), page_description=html.escape(meta['desc']),
                   page_url=url, og_image=f'{facts["site"]}/{meta["og"]}' if meta.get('og') and facts['site'] else '',
                   og_alt=html.escape(f'Tray UI: {meta["title"]}' if not home else f'Tray UI: {len(comps)} components in plain HTML and CSS'),
                   md_url='' if home else f'/{meta["path"]}.md', jsonld=graph(ident, meta, sec) if facts['site'] else '',
                   nav_html=nav_html(sec, ident) if sec and sec.get('side', True) else '', noside=bool(sec and sec.get('side') is False),
                   view_html=entry['html'], wide=bool(meta.get('wide')),
                   sections_tabs=''.join(f'<a class="tray-tab" href="/{route(s["home"])}"' + (' aria-current="page"' if s is sec else '') + f'>{html.escape(s["title"])}</a>' for s in sections if s.get('tab', True)),
                   preload='' if meta.get('bare') else meta['file'], own_pages=hashed if home else '{}', feed=bool(articles and facts['site']))
        out = OUT / ('index.html' if home else meta['path'] + '.html')
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(addressed(fill(template, one), index), encoding='utf-8')
    unlisted = {it['id'] for s in sections for g in s['nav'] for it in g['items'] if it.get('unlisted')}  # the later pages of a list: not in a search
    (OUT / '404.html').write_text(addressed(fill((SRC / '404.html').read_text(encoding='utf-8'), dict(asset, search_list=''.join(
        f'<a class="tray-option" href="/{m["path"]}" role="option" data-value="/{m["path"]}"><span class="tray-option__text">{html.escape(m["title"])}</span>'
        f'<span class="tray-option__meta">{html.escape(by_id[m["section"]]["title"])}</span></a>' for i, m in index.items() if m['section'] and i not in unlisted))), index), encoding='utf-8')

    # every page as Markdown, beside its file: the same address with .md added. Links go to the other pages' Markdown.
    base = facts['site']
    def to_md(text):
        text = re.sub(r'\]\(#([a-z0-9-]+)\)', lambda m: f']({base}/{"llms.txt" if m.group(1) == "home" else route(m.group(1)) + ".md"})' if m.group(1) in index else m.group(0), text)
        return re.sub(r'\]\(([A-Za-z0-9./-]+\.(?:zip|txt|css|js|cjs|json))\)', lambda m: f']({base}/{m.group(1)})', text)
    note = f'> Part of Tray UI {VERSION}, a design system in plain HTML and CSS ({facts["license"]} licence). Every page: {base}/llms.txt'
    for ident, text in mds.items():
        if not text or ident == 'home':
            continue
        first, _, rest = text.partition('\n')
        target = OUT / (index[ident]['path'] + '.md')
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(to_md(f'{first}\n\n{note}\n{rest}'), encoding='utf-8')

    if facts['site']:  # for search engines and other readers, once the site is open to everyone
        (OUT / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
                                         + ''.join(f'  <url><loc>{html.escape(facts["site"] + "/" + m["path"])}</loc>' + (f'<lastmod>{m["lastmod"]}</lastmod>' if m.get('lastmod') else '') + '</url>\n'
                                                   for m in index.values()) + '</urlset>\n', encoding='utf-8')
        robots = '# Tray UI documentation (MIT). Search, AI answers, agent fetches and training are welcome.\nUser-agent: *\nAllow: /\n'
        (OUT / 'robots.txt').write_text(robots + f'\nSitemap: {facts["site"]}/sitemap.xml\n', encoding='utf-8')
        if articles:  # the articles as an Atom feed, whole, for readers and for sites that take a feed (with the address here as the original)
            site, esc = facts['site'], lambda s: html.escape(s, quote=False)
            stamp = lambda a: max(d for d in (index[a['id']].get('lastmod'), a['published']) if d) + 'T00:00:00Z'
            def content(a):
                prose = re.sub(r'<div class="tray-code__head">.*?</div>', '', addressed(a['prose'], index), flags=re.S)  # the label and the copy button: page furniture
                return re.sub(r'(href|src)="/(?!/)', rf'\1="{site}/', prose)
            who = f'<author><name>{esc(facts["author"])}</name><uri>{esc(facts["author_url"])}</uri></author>' if facts['author'] else ''
            (OUT / 'articles').mkdir(exist_ok=True)
            (OUT / 'articles' / 'feed.xml').write_text(
                '<?xml version="1.0" encoding="utf-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en">\n'
                f'<title>Tray UI articles</title>\n<subtitle>{esc(index["articles"]["summary"])}</subtitle>\n'
                f'<link rel="self" href="{site}/articles/feed.xml"/>\n<link rel="alternate" type="text/html" href="{site}/articles"/>\n'
                f'<id>{site}/articles</id>\n<updated>{max(stamp(a) for a in articles)}</updated>\n{who}\n'
                + ''.join(f'<entry>\n<title>{esc(a["title"])}</title>\n<link rel="alternate" type="text/html" href="{site}/{route(a["id"])}"/>\n<id>{site}/{route(a["id"])}</id>\n'
                          f'<published>{a["published"]}T00:00:00Z</published>\n<updated>{stamp(a)}</updated>\n<category term="{html.escape(a["group"])}"/>\n'
                          f'<summary>{esc(unmark(a["summary"]))}</summary>\n<content type="html">{esc(content(a))}</content>\n</entry>\n' for a in articles)
                + '</feed>\n', encoding='utf-8')

    # the download: dist/ as one archive, with the blocks beside the three files
    with zipfile.ZipFile(OUT / facts['zip'], 'w', zipfile.ZIP_DEFLATED) as z:
        for f in sorted(DIST.rglob('*')):
            if f.is_file() and not f.name.startswith('.') and f.relative_to(DIST).parts[0] != 'skills':  # the skill has an archive of its own, skills/trayui.zip
                z.write(f, f'trayui/{f.relative_to(DIST)}')

    # llms.txt: the index of the system for an agent, in the form llmstxt.org sets out; llms-full.txt: all of it in one file
    link = lambda ident: f'{base}/{index[ident]["path"]}.md'
    install = (f'<link rel="stylesheet" href="{facts["cdn"]}/tokens.css">\n<link rel="stylesheet" href="{facts["cdn"]}/components/bundle.css">\n'
               f'<script src="{facts["cdn"]}/components/bundle.js" defer></script>')
    notes = (('- From npm: `npm install trayui` for the three files, `npm install trayui-react` for React (it needs `react` and `react-dom`, and `recharts` for the charts).\n'
              if NPM else '- The React package, `trayui-react`, is not published on npm yet. Do not install a package of that name from npm: it would not be this one. '
              'The React page says where it is.\n')
             + f'- `npx trayui init` and `npx trayui add <name>` put the files, a block or, in React, the source of a component into a project; `npx trayui check page.html` checks markup against the rules ([the CLI]({base}/docs/cli.md)).\n'
             f'- The same items are a registry in shadcn\'s format: [{base}/r/registry.json]({base}/r/registry.json) (React) and [{base}/r/html/registry.json]({base}/r/html/registry.json) (plain HTML), as in `npx shadcn add {base}/r/login-01.json`.\n'
             f'- A skill for agents, with the rules, every page as Markdown and the checker: [{base}/skills/trayui.zip]({base}/skills/trayui.zip) ([how to install it]({base}/docs/skill.md)).\n'
             + '- Counter and Perly Farm, the brands in the examples, are invented, and so is every name and figure in them.\n'
             '- Use only classes that exist; where a layout needs a value no class gives, use a token (`var(--space-6)`), never a literal colour or size.\n')
    intro = (f'# Tray UI\n\n> A design system in plain HTML and CSS: {len(comps)} components, {len(blocks)} blocks, {len(templates)} page templates, {len(icons)} icons and {len(themes["list"])} themes, '
             f'with typed React components and {len(charts)} chart examples on Recharts. Version {VERSION}, {facts["license"]} licence'
             + (f', by {facts["author"]}' if facts['author'] else '') + '.\n\n'
             'Link three files and write HTML with `tray-` classes; behaviours attach with `data-tray`, and nothing needs a build step:\n\n'
             f'```html\n{install}\n```\n\n')
    lines = [intro, f'Every page of {base or "the site"} is also Markdown: add `.md` to its address. [llms-full.txt]({base}/llms-full.txt) holds the whole system in one file.\n\n' + notes]
    lines.append('\n## Docs\n\n' + ''.join(f'- [{index[d["id"]]["title"]}]({link(d["id"])}): {index[d["id"]]["desc"]}\n' for d in docs + foundations))
    lines.append('\n## Guides\n\n' + ''.join(f'- [{g["title"]}]({link(g["id"])}): {index[g["id"]]["desc"]}\n' for g in guides))
    lines.append(f'\n## Components\n\n- [All {len(comps)} components]({link("components")}): each with the sentence that says what it is for\n'
                 + ''.join(f'- [{c["title"]}]({link(c["id"])})\n' for c in order))
    lines.append(f'\n## Blocks\n\nWhole screens to copy, each one HTML file.\n\n- [All {len(blocks)} blocks]({link("blocks")}): every block with a sentence on what it holds\n'
                 f'- [Sign-in and sign-up pages]({link("b-login")})\n- [Sidebars]({link("b-sidebar")})\n')
    lines.append(f'\n## Templates\n\nWhole pages of a product to copy, each one HTML file.\n\n- [All {len(templates)} templates]({link("templates")}): every template with a sentence on what it holds\n')
    lines.append('\n## Charts\n\n' + f'- [Using the charts]({link("ch-use")}): {index["ch-use"]["desc"]}\n'
                 + ''.join(f'- [{g["title"]}]({link(g["page"])}): {unmark(g["summary"])}\n' for g in chart_groups))
    if articles:
        # the list and the pages of the topics, not every article: this file stays a short index, and those pages list them all, page by page
        lines.append(f'\n## Articles\n\nHow to build parts of an interface in plain HTML, CSS and JavaScript, worked through with the code of Tray UI.\n\n'
                     f'- [All {len(articles)} articles]({link("articles")}): newest first, each with its summary, {1 + PER_PAGE} on the first page and {PER_PAGE} on each after it; each page links the others\n'
                     + ''.join(f'- [{t["title"]}]({link(t["id"])}): {unmark(t["summary"])}\n' for t in topics))
    lines.append(f'\n## Optional\n\n- [llms-full.txt]({base}/llms-full.txt): the rules, the guides and the guidelines of every component in one file\n'
                 f'- [{facts["zip"]}]({base}/{facts["zip"]}): the three files, the font, the {len(blocks)} blocks and the {len(templates)} templates\n')
    (OUT / 'llms.txt').write_text(''.join(lines), encoding='utf-8')

    full = [intro + notes + '\nThe sections: installation, the CLI, the rules (the brand book), the guides, theming, React, Tailwind and Figma, '
            'coming from Tailwind, for AI agents, the agent skill, the component index, the guidelines of every component, the blocks, '
            'the templates, charts in React, and the changelog.\n']
    doc = lambda ident, title=None: headings(f'# {title or index[ident]["title"]}\n\n' + mds[ident].split('\n', 1)[1].strip(), 2)
    full.append(doc('d-installation'))
    full.append(doc('d-cli'))
    full.append(doc('g-brand', 'Rules: the brand book'))
    full += [doc(g['id']) for g in guides if g['id'] != 'g-brand']
    full += [doc(i) for i in ('d-theming', 'd-themes', 'd-react', 'd-tailwind-figma', 'd-from-tailwind', 'd-agents', 'd-skill') if i in mds and mds[i]]
    full.append(headings('# Component index\n\n' + re.sub(r'^# .*\n', '', (P / 'guides' / '0-components.md').read_text(encoding='utf-8').strip()), 2))
    full.append('## The guidelines of every component\n\nEach component with its markup, in the order of the index.\n')
    full += [headings(c['readme'], 3) for c in order]
    full.append(f'## Blocks\n\n{len(blocks)} whole screens, each one HTML file to copy. The code of each is on its page, as Markdown at the address given.\n\n'
                + ''.join(f'### {g}\n\n' + ''.join(f'- [{x["title"]}]({link(x["id"])}): {unmark(x["summary"])}\n' for x in its) + '\n' for g, its in block_groups))
    full.append(f'## Templates\n\n{len(templates)} whole pages of a product, each one HTML file to copy. The code of each is on its page, as Markdown at the address given.\n\n'
                + ''.join(f'### {g}\n\n' + ''.join(f'- [{x["title"]}]({link(x["id"])}): {unmark(x["summary"])}\n' for x in its) + '\n' for g, its in template_groups))
    full.append(doc('ch-use', 'Charts in React'))
    full.append(doc('d-changelog'))
    (OUT / 'llms-full.txt').write_text(to_md('\n\n'.join(part.strip() for part in full) + '\n'), encoding='utf-8')

    # the skill for agents, from the Markdown of the pages just written: dist/skills/trayui (the package carries it), and
    # skills/trayui.zip, both a skill for claude.ai and a Claude Code plugin, with the marketplace.json that lists it
    import skill
    skilled = skill.write(OUT, DIST, facts)
    # the registry in shadcn's format, for npx trayui and npx shadcn: r/ (React: the core, every component as its source,
    # every block as a component) and r/html/ (the three files and every block as a page)
    import registry
    registered = registry.write(OUT, f'{facts["site"]}/r' if facts['site'] else None)

    size = sum(f.stat().st_size for f in OUT.rglob('*') if f.is_file())
    first = sum((OUT / f).stat().st_size for f in ('index.html', files['site.css'], files['site.js'], data, files['tokens.css'], files['components/bundle.css'], files['components/bundle.js']))
    print(bundled)
    print(bundled_code)
    print(said)
    print(f'site: {len(plays)} playgrounds')
    print(f'site: the registry at r/, {registered["react"]} React items and {registered["html"]} plain HTML ones')
    print(f'site: the skill, {skilled["references"]} pages and the checker in dist/skills/trayui ({skilled["kb"]} KB), skills/trayui.zip ({skilled["zip_kb"]} KB)')
    print(f'site: {len(index)} pages ({len(comps)} components, {len(blocks)} blocks, {len(templates)} templates, {len(charts)} charts, {len(docs) + len(foundations) + len(guides)} docs), '
          f'{len(runs)} preview scripts; first load {first // 1024} KB, all {size // 1024} KB in {len(list(OUT.rglob("*.*")))} files')
    for line in skipped:
        print('LEFT OUT', line)


def git_dates():
    """The day each file was last changed in a commit, from git: {path from the root of the repository: 'YYYY-MM-DD'}.
    Outside a clone of the repository, nothing."""
    try:
        out = subprocess.run(['git', 'log', '--format=@%cI', '--name-only'], cwd=ROOT.parent, capture_output=True, text=True, timeout=60)
    except (OSError, subprocess.TimeoutExpired):
        return {}
    dates, when = {}, None
    for line in out.stdout.splitlines() if out.returncode == 0 else []:
        if line.startswith('@'):
            when = line[1:11]
        elif line.strip() and when and line not in dates:
            dates[line] = when
    return dates


if __name__ == '__main__':
    build()
