#!/usr/bin/env python3
"""Open the built site/ in a browser over http and check it: the home page, every page of every section, the search,
the playgrounds of the components, the frames that show blocks, the charts drawn by Recharts, the
foundations, the ten themes, the maker of another and a theme sent as a link, a phone, and the files for Tailwind and Figma.

    python3 tools/site_check.py            checks, and screenshots in .preview/site/
"""
import html, json, pathlib, re, sys, urllib.error, urllib.parse, urllib.request, zipfile
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE, SHOTS = ROOT / 'site', ROOT / '.preview' / 'site'
sys.path.insert(0, str(ROOT / 'tools'))
from serve import serve  # the site at its real addresses, as the host serves it
results = []


def plain_name(url):
    """The name of a file the browser asked for, without the hash the build puts in it: _/pages/c-button.1a2b3c4d5e.js is
    pages/c-button.js, _/charts.1a2b3c4d5e.js is charts.js; anything else, its last part."""
    path = urllib.parse.urlparse(url).path
    if path.startswith('/_/'):
        return re.sub(r'\.[0-9a-f]{10}(\.\w+)$', r'\1', path[3:])
    return path.rsplit('/', 1)[-1]


def check(name, ok, detail=''):
    results.append((name, bool(ok), str(detail)))


def go(pg, ident, more=''):
    """Open a page the way a link does: its address joins the history, and the site draws it without loading again."""
    pg.evaluate('([id, more]) => window.TRAY_SITE.go(id, more)', [ident, more])


def here(pg):
    """The id of the page the address names."""
    return pg.evaluate('window.TRAY_SITE.here()')


def answer(url):
    """The status of an address and where it sends, without following it."""
    class Stay(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, *a, **k): return None
    try:
        r = urllib.request.build_opener(Stay).open(url)
        return r.status, r.headers.get('Location'), r.read().decode('utf-8', 'replace')
    except urllib.error.HTTPError as e:
        return e.code, e.headers.get('Location'), e.read().decode('utf-8', 'replace')


def settled(pg):
    """Wait until every animation and transition with an end has ended: a colour that is still fading is not the colour."""
    try: pg.wait_for_function("() => !document.getAnimations().some(a => a.playState === 'running' && isFinite(a.effect.getComputedTiming().endTime))", timeout=3000)
    except Exception: pass


def pick(pg, selector):
    """Choose a segment: bring it to the middle of the window, clear of the header that stays in place, and click its label."""
    pg.evaluate("s => document.querySelector(s).closest('label').scrollIntoView({ block: 'center' })", selector)
    pg.locator(selector).locator('xpath=..').click()


FRAME_JS = '''() => { const f = document.querySelector('.site-frame iframe'); if (!f || !f.contentDocument || !f.contentDocument.body) return null; const d = f.contentDocument;
  return { kids: d.body.children.length, over: d.documentElement.scrollWidth - d.documentElement.clientWidth, width: f.contentWindow.innerWidth,
           styled: getComputedStyle(d.body).fontFamily.includes('Onest'), wired: !!f.contentWindow.TrayUI, theme: d.documentElement.dataset.theme }; }'''


def main():
    SHOTS.mkdir(parents=True, exist_ok=True)
    data = next((SITE / '_').glob('data.*.js')).read_text(encoding='utf-8')  # the map of the site: its name holds a hash of it
    site = json.loads(data[data.index('{'):data.index(';\nwindow.TRAY_SITE.run')].replace('<\\/', '</'))
    index = site['index']
    by_section = {sec['id']: [it['id'] for g in sec['nav'] for it in g['items']] for sec in site['sections']}
    docs, comps = by_section['docs'], by_section['components']
    block_ids = [i for i in by_section['blocks'] if i not in ('blocks', 'b-login', 'b-sidebar')]  # the blocks, without the pages that gather them
    chart_pages = by_section['charts']
    article_ids = [i for i in by_section.get('articles', []) if i != 'articles']  # the articles, without the page that lists them
    titles = [s['title'] for s in site['sections']]  # Docs, Components, Blocks, Charts, and Articles once there is one
    every = ['home'] + docs + comps + by_section['blocks'] + chart_pages + by_section.get('articles', [])
    framed = set(block_ids)
    contrast = re.search(r'CONTRAST_JS = r"""(.*?)"""', (ROOT / 'tools' / 'shoot.py').read_text(encoding='utf-8'), re.S).group(1)
    check('every page of the map has a place in a sidebar, or is the home page', sorted(every) == sorted(index), sorted(set(index) ^ set(every))[:6])

    # the files a visitor may take
    zips = sorted(SITE.glob('trayui-*.zip'))
    names = zipfile.ZipFile(zips[0]).namelist() if zips else []
    check('the download holds the three files, the font with its licence, the licence of the system and the blocks',
          all(n in names for n in ('trayui/tokens.css', 'trayui/components/bundle.css', 'trayui/components/bundle.js', 'trayui/fonts/Onest-Variable.ttf',
                                   'trayui/fonts/OFL.txt', 'trayui/LICENSE', 'trayui/blocks/sidebar-01.html')) and not any('/templates/' in n for n in names), names[:8])
    index_txt = (SITE / 'llms.txt').read_text(encoding='utf-8')
    llms = (SITE / 'llms-full.txt').read_text(encoding='utf-8')
    check('llms.txt is a short index: what Tray UI is, how to install it, and a link to the Markdown of every component', index_txt.startswith('# Tray UI\n\n> ') and len(index_txt) < 16000
          and index_txt.count('/components/') >= len(comps) and '.md)' in index_txt and 'tokens.css' in index_txt, len(index_txt))
    check('llms-full.txt holds the rules, the guides and every component, each heading under its component', llms.startswith('# Tray UI') and '### Button' in llms and '### Footer' in llms
          and '#### Markup' in llms and '\n## Markup' not in llms and 'data-tray' in llms, len(llms))
    check('llms-full.txt says how charts are made in React', '## Charts in React' in llms and 'ChartContainer' in llms)
    mds = [SITE / (m['path'] + '.md') for i, m in index.items() if i != 'home']
    check('every page but the home page is also Markdown, at its address with .md added', all(f.exists() for f in mds), [str(f) for f in mds if not f.exists()][:4])
    robots = (SITE / 'robots.txt').read_text(encoding='utf-8') if (SITE / 'robots.txt').exists() else ''
    check('robots.txt lets every reader in and names the sitemap', 'User-agent: *\nAllow: /' in robots and f'Sitemap: {site["site"]}/sitemap.xml' in robots, robots)
    check('the download and the site hold the tokens for Tailwind 4 and 3 and the Figma variables, a file for each theme',
          all(f'trayui/{n}' in names for n in ('tailwind/theme.css', 'tailwind/preset.cjs', 'figma/colours/Light.tokens.json', 'figma/colours/Espresso.tokens.json', 'figma/scale/Scale.tokens.json'))
          and (SITE / 'tailwind' / 'theme.css').exists() and len(list((SITE / 'figma' / 'colours').glob('*.tokens.json'))) == 10, [n for n in names if 'tailwind' in n or 'figma' in n][:4])
    figma = json.loads((SITE / 'figma' / 'colours' / 'Dark.tokens.json').read_text(encoding='utf-8'))
    check('a Figma colour is an sRGB value with its hex, in the format Figma imports', figma['page']['$type'] == 'color' and figma['page']['$value']['colorSpace'] == 'srgb'
          and figma['page']['$value']['hex'].startswith('#') and len(figma['page']['$value']['components']) == 3, figma['page'])
    tw = (SITE / 'tailwind' / 'theme.css').read_text(encoding='utf-8')
    check('the Tailwind theme maps the tokens without declaring them again', '@theme inline reference {' in tw and '--color-page: var(--page);' in tw and '--radius-card: var(--radius-card);' in tw and '@custom-variant dark' in tw)
    check('llms-full.txt says how to use the tokens with Tailwind and Figma', '## Tailwind and Figma' in llms and 'tailwind/theme.css' in llms)
    # what each page says to a search: the names people use, a note on every block, the articles and their feed
    search = json.loads((ROOT / 'tools' / 'site' / 'search.json').read_text(encoding='utf-8'))
    slug = lambda n: re.sub(r'(?<=[a-z0-9])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])', '-', n).lower()
    page_of = lambda ident: (SITE / (index[ident]['path'] + '.html')).read_text(encoding='utf-8')
    title_of = lambda text: html.unescape(re.search(r'<title>([^<]*)</title>', text).group(1))
    named = {n: (s, also) for n, (s, also) in search['components'].items()}
    wrong = [n for n, (s, also) in named.items() if (s and not title_of(page_of('c-' + slug(n))).startswith(s + ':') and not title_of(page_of('c-' + slug(n))).startswith(s + ' '))
             or (also and f'Also called {also}.' not in html.unescape(page_of('c-' + slug(n))))]
    check('a component known by another name has that name first in its title and says what else it is called', not wrong and len(named) > 80, wrong[:5])
    notes = ROOT / 'tools' / 'site' / 'block-notes'
    plain = lambda md: ' '.join(re.sub(r'\[([^\]]+)\]\([^)]*\)', r'\1', md).replace('`', '').replace('**', '').split())
    unsaid = [i for i in block_ids if not (notes / f'{i[2:]}.md').exists()
              or ' '.join(plain((notes / f'{i[2:]}.md').read_text(encoding='utf-8')).split()[:8]) not in ' '.join(html.unescape(re.sub(r'<[^>]+>', ' ', page_of(i))).split())]
    check('every block page says what the screen is for and when to choose it, from its note', not unsaid, unsaid[:5])
    heads = [title_of(page_of(i)) for i in comps + block_ids]
    check('every component and block title names HTML and CSS and fits a search result', all('HTML' in h and len(h) <= 60 for h in heads), [h for h in heads if 'HTML' not in h or len(h) > 60][:4])
    if article_ids:
        listing = page_of('articles')
        lds = {i: json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>', page_of(i), re.S).group(1)) for i in article_ids}
        kinds = {i: next(n for n in ld['@graph'] if n['@type'] != 'BreadcrumbList') for i, ld in lds.items()}
        every_one = listing.split('id="art-all"', 1)[-1].split('role="tabpanel"', 1)[0]  # the panel of the tab All
        topics = [g['group'] for s in site['sections'] if s['id'] == 'articles' for g in s['nav'] if g['group']]  # the sidebar groups the articles by topic
        check('the Articles page is laid out as the journal block: a tab for each topic with its count, the newest article large, then the others, each with its picture and day',
              listing.count('role="tab"') == 1 + len(topics) and f'class="tray-card site-lead" href="/{index[article_ids[0]]["path"]}"' in listing
              and all(f'href="/{index[i]["path"]}"' in every_one for i in article_ids) and every_one.count('<time datetime=') == len(article_ids)
              and every_one.count('<div class="site-thumb') == len(article_ids) and every_one.count('<svg aria-hidden="true" focusable="false"') == len(article_ids),
              (listing.count('role="tab"'), every_one.count('<div class="site-thumb')))
        unread = []
        for i in article_ids:
            text = page_of(i)
            marks = re.findall(r'<a class="tray-sidebar__item" href="#([a-z0-9-]+)"', text.split('class="tray-sidebar tray-sidebar--plain site-toc"', 1)[-1].split('</nav>', 1)[0])
            if not (marks and all(f' id="{m}"' in text for m in marks) and 'class="tray-crumbs"' in text and 'class="tray-person"' in text
                    and 'minutes to read' in text and '<time datetime=' in text and 'data-target="#art-link"' in text):
                unread.append(i)
        check('each article is laid out as the long read: the way back, who wrote it, its day and how long it takes, contents that lead to its headings, and a way to share it', not unread, unread)
        check('each article is an Article for search engines, with its author and the days it came out and changed',
              all(k['@type'] == 'Article' and re.fullmatch(r'\d{4}-\d\d-\d\d', k.get('datePublished', '')) and k.get('dateModified') and k['author'].get('name') and k.get('image') for k in kinds.values()),
              {i: k['@type'] for i, k in kinds.items()})
        import xml.etree.ElementTree as ET
        feed = ET.parse(SITE / 'articles' / 'feed.xml').getroot() if (SITE / 'articles' / 'feed.xml').exists() else None
        A = '{http://www.w3.org/2005/Atom}'
        entries = feed.findall(A + 'entry') if feed is not None else []
        check('the Atom feed holds every article whole, its links on this site, and every page names it',
              len(entries) == len(article_ids) and all(f'href="{site["site"]}/' in e.find(A + 'content').text and 'tray-code__head' not in e.find(A + 'content').text for e in entries)
              and all('type="application/atom+xml"' in text for text in (listing, (SITE / 'index.html').read_text(encoding='utf-8'), page_of('c-button'))), len(entries))
        check('llms.txt lists the articles', '## Articles' in index_txt and all(f'/{index[i]["path"]}.md' in index_txt for i in article_ids))
    notice = (SITE / 'charts.licenses.txt').read_text(encoding='utf-8') if (SITE / 'charts.licenses.txt').exists() else ''
    check('the script that draws the charts comes with the licences of what it holds', any((SITE / '_').glob('charts.*.js')) and all(f'\n{n} ' in notice for n in ('recharts', 'react', 'react-dom')) and 'MIT License' in notice, len(notice))

    server, url = serve()
    with sync_playwright() as p:
        b = p.chromium.launch(channel='chrome')
        ctx = b.new_context(viewport={'width': 1440, 'height': 900}, reduced_motion='reduce', color_scheme='light', permissions=['clipboard-read', 'clipboard-write'])
        pg = ctx.new_page(); errors, asked = [], []
        pg.on('pageerror', lambda e: errors.append(str(e)[:200]))
        pg.on('console', lambda m: errors.append(m.text[:200]) if m.type == 'error' else None)
        # A request the browser cut off because the page moved on (a frame taken away while its script or font loaded) is
        # not a failure; one the network failed is, and so is a file the site does not have (an answer of 400 or more).
        pg.on('requestfailed', lambda r: None if 'ERR_ABORTED' in (r.failure or '') else errors.append('failed: ' + r.url[-60:]))
        pg.on('response', lambda r: errors.append(f'{r.status}: ' + r.url[-60:]) if r.status >= 400 else None)
        pg.on('request', lambda r: asked.append(plain_name(r.url)))
        pg.goto(url, wait_until='load'); pg.evaluate('document.fonts.ready'); pg.wait_for_timeout(700)
        if not pg.locator('#site-view h1').count():
            # the page did not draw: say what the browser saw, then try once more, so one lost request does not sink the whole run
            print('the first load drew nothing; the browser reported:', errors[:6], '| scripts asked for:', [a for a in asked if a.endswith('.js')])
            errors.clear(); asked.clear()
            pg.goto(url, wait_until='load'); pg.evaluate('document.fonts.ready'); pg.wait_for_timeout(1500)

        # ---------- the home page ----------
        page_html = (SITE / 'index.html').read_text(encoding='utf-8')
        check('the home page is drawn in index.html, before any script runs, and the scripts wait for it', 'components in plain HTML and CSS' in page_html and 'data-prerendered="home"' in page_html
              and page_html.count(' defer></script>') == 3 and 'rel="preload" href="fonts/' in page_html)
        shifts = {}
        for where in ('', 'components/button', 'docs', 'blocks/stats-02'):
            for w, h in ((1440, 900), (390, 844)):
                cp = b.new_page(viewport={'width': w, 'height': h})
                cp.add_init_script("window.__cls = 0; new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true });")
                cp.goto(url + where, wait_until='load'); cp.wait_for_timeout(1500)
                shifts[f'{where or "home"} {w}'] = round(cp.evaluate('window.__cls'), 4); cp.close()
        check('opening the site, or a link straight to a component, a doc or a block, moves nothing on the page, at 1440 and at 390 wide', all(v < 0.01 for v in shifts.values()), shifts)
        check('the font loads from the site\'s own file', pg.evaluate('document.fonts.check("16px Onest")'))
        check('the site opens on the home page', pg.locator('#site-view h1').inner_text().endswith('components in plain HTML and CSS') and pg.title().startswith('Tray UI'), pg.title())
        check('the home page has no sidebar and the header links every section, none of them current',
              pg.locator('.tray-app__side').is_hidden() and pg.locator('#site-sections .tray-tab').all_inner_texts() == titles
              and titles[:4] == ['Docs', 'Components', 'Blocks', 'Charts']
              and pg.locator('#site-sections [aria-current]').count() == 0, pg.locator('#site-sections .tray-tab').all_inner_texts())
        mark = pg.evaluate("(() => { const m = document.querySelector('.site-top a.site-logo .site-mark'); if (!m) return null; const cs = getComputedStyle(document.documentElement); "
                           "return [getComputedStyle(m.querySelector('.site-mark__tile')).fill, getComputedStyle(m.querySelector('.site-mark__bar')).fill, Math.round(m.getBoundingClientRect().width), m.getAttribute('aria-hidden'), "
                           "decodeURIComponent(document.querySelector('link[rel=icon]').href).includes('fill=\"#ffd426\"')]; })()")
        check('the mark of the system stands before its name: a yellow tile with an ink bar, the same as the icon of the tab', mark == ['rgb(255, 212, 38)', 'rgb(20, 20, 20)', 28, 'true', True]
              and pg.locator('.site-top a.site-logo').inner_text() == 'Tray UI', mark)
        pg.hover('.site-top a.site-logo'); pg.wait_for_timeout(350)
        lifted = pg.evaluate("getComputedStyle(document.querySelector('.site-top .site-mark__bar')).transform")
        pg.mouse.move(700, 500)
        check('for a visitor who asks for reduced motion the mark stays still', lifted == 'none', lifted)
        shown_home = {f'pages/{i}.js' for i in re.findall(r'name="home-show" value="([a-z0-9-]+)"', page_html)}  # the blocks the home page shows live in its frame
        check('no page but the home page, and the block it shows, is loaded before one is opened', 'data.js' in asked
              and not any(a.startswith('pages/') and a not in shown_home for a in asked),
              [a for a in asked if a.endswith('.js')])
        check('the script that draws the charts is not loaded before a chart comes near the window', 'charts.js' not in asked, [a for a in asked if 'chart' in a])
        check('the home page shows real components: a chart, a calendar, a counter that counts',
              pg.locator('.site-home .tray-bento .tray-chart svg').count() == 1 and pg.locator('.site-home .tray-cal__day').count() >= 28, pg.locator('.site-home .tray-cal__day').count())
        pg.locator('.site-home [data-step="1"]').click()
        check('a component on the home page works', pg.locator('.site-home .tray-btn-group__value').inner_text() == '3')
        pg.evaluate("document.querySelector('.site-show').scrollIntoView({ block: 'center' })"); pg.wait_for_timeout(900)  # clear of the header, which stays in place
        f = pg.evaluate(FRAME_JS)
        check('the home page shows a block live in a frame', f and f['kids'] >= 2 and f['styled'] and f['wired'], f)
        shown_before = pg.evaluate("document.querySelector('.site-show iframe').contentDocument.title")
        pick(pg, '.site-show input[value="b-shop-01"]'); pg.wait_for_timeout(900)
        shown_after = pg.evaluate("document.querySelector('.site-show iframe').contentDocument.title")
        check('the control over the frame changes the page it shows', shown_after != shown_before and shown_after == index['b-shop-01']['title'], (shown_before, shown_after))
        themes = pg.evaluate("[...document.querySelectorAll('.site-themes__one')].map(e => getComputedStyle(e.querySelector('.tray-card')).backgroundColor)")
        check('a part of the page can be in the other theme', len(themes) == 2 and themes[0] != themes[1], themes)
        check('the home page shows every icon', pg.locator('.site-iconwall .tray-icon').count() == len(json.loads((ROOT / 'src' / 'icons.json').read_text(encoding='utf-8'))), pg.locator('.site-iconwall .tray-icon').count())
        pg.evaluate("document.getElementById('home-charts').scrollIntoView({ block: 'start' })"); pg.wait_for_timeout(1500)
        check('the home page draws three charts when they come into view', 'charts.js' in asked and pg.locator('.site-home [data-rechart] svg.recharts-surface').count() == 3,
              pg.locator('.site-home [data-rechart] svg.recharts-surface').count())
        pg.evaluate('window.scrollTo(0, 0)'); pg.wait_for_timeout(200)
        pg.screenshot(path=str(SHOTS / 'home.png'))
        pg.locator('.tray-hero__actions .tray-btn').first.click(); pg.wait_for_timeout(200)
        check('"Get started" opens the installation page, in the Docs section', here(pg) == 'd-installation' and pg.locator('#site-sections [aria-current="page"]').inner_text() == 'Docs'
              and pg.locator('.tray-app__side').is_visible() and pg.locator('#site-nav [aria-current="page"]').inner_text() == 'Installation')
        check('the installation page offers the download and shows the markup to link', pg.locator('.site-prose a[download]').count() == 1 and pg.locator('.site-prose .tray-code').count() >= 3)
        pg.screenshot(path=str(SHOTS / 'installation.png'))
        tints = pg.evaluate('''() => { const k = document.querySelector('.site-prose .tray-code .hljs-tag .hljs-name');
          return k ? [getComputedStyle(k).color, getComputedStyle(k.closest('code')).color] : null; }''')
        check('the code of a doc comes coloured by the build, GitHub\'s way: a tag name is green, not ink', tints and tints[0] == 'rgb(17, 99, 41)' and tints[0] != tints[1], tints)
        check('the script that colours code in the page is not loaded where the build already coloured it', 'code.js' not in asked, [a for a in asked if 'code' in a])

        # ---------- the search ----------
        pg.keyboard.press('/'); pg.wait_for_timeout(150)
        check('"/" opens the search with every page in it', pg.evaluate("document.getElementById('site-search').open") and pg.locator('#site-command [role="option"]').count() == len(every) - 1
              and pg.evaluate("document.activeElement === document.querySelector('#site-command input')"), pg.locator('#site-command [role="option"]').count())
        pg.keyboard.type('date')
        shown = pg.locator('#site-command [role="option"]:visible').all_inner_texts()
        check('typing narrows the list', [s.split('\n')[0] for s in shown] == ['Date Picker'], shown)
        pg.screenshot(path=str(SHOTS / 'search.png'))
        pg.keyboard.press('Enter'); pg.wait_for_timeout(500)
        check('Enter opens the match and closes the search', here(pg) == 'c-date-picker' and not pg.evaluate("document.getElementById('site-search').open") and pg.inner_text('#site-view h1') == 'Date Picker')
        check('opening a component loads that page alone; the other components and the blocks wait until they are shown', 'pages/c-date-picker.js' in asked and 'pages/c-button.js' not in asked
              and not any(a.startswith('pages/b-') and a not in shown_home for a in asked), [a for a in asked if a.startswith('pages/')])
        pg.keyboard.press('Control+k'); pg.wait_for_timeout(150)
        pg.keyboard.type('zzz')
        check('Ctrl with K opens the search too, and it says when nothing matches', pg.locator('#site-command .tray-list__empty').is_visible())
        pg.keyboard.press('Escape'); pg.wait_for_timeout(150)
        check('Escape closes the search', not pg.evaluate("document.getElementById('site-search').open"))
        pg.click('#site-find'); pg.wait_for_timeout(150); pg.keyboard.type('sidebar with a file')
        pg.locator('#site-command [role="option"]:visible').first.click(); pg.wait_for_timeout(600)
        check('the search button opens it, and a click on a result opens that page', here(pg) == 'b-sidebar-09')

        # ---------- addresses: every page at one of its own ----------
        undrawn = []
        for i, m in index.items():
            f = SITE / ('index.html' if i == 'home' else m['path'] + '.html')
            text = f.read_text(encoding='utf-8') if f.exists() else ''
            if f'data-prerendered="{i}"' not in text or '<h1' not in text or f'data-route="{m["path"]}"' not in text:
                undrawn.append(i)
        check(f'every page has a file of its own, drawn in it, for its address ({len(index)} pages)', len(index) > 200 and not undrawn, undrawn[:5])
        lightbox = (SITE / 'components' / 'lightbox.html').read_text(encoding='utf-8')
        lb = index['c-lightbox']
        check('a page\'s file names it: its title, its description, its one address, its picture, its Markdown and its place in the site', f'<title>{lb["head"]}</title>' in lightbox
              and lb['head'] == 'Lightbox (image gallery): HTML and CSS component - Tray UI' and '<meta name="description" content="' + html.escape(lb['desc'])[:30] in lightbox
              and f'<link rel="canonical" href="{site["site"]}/components/lightbox">' in lightbox and (lb.get('bare') or f'rel="preload" href="/{lb["file"]}"' in lightbox)
              and f'<meta property="og:image" content="{site["site"]}/{lb["og"]}">' in lightbox and '<link rel="alternate" type="text/markdown" href="/components/lightbox.md">' in lightbox
              and '"@type":"BreadcrumbList"' in lightbox)
        heads = [m['head'] for m in index.values()]
        check('no two pages share a title, and none is longer than 60 characters', len(set(heads)) == len(heads) and max(map(len, heads)) <= 60, max(heads, key=len))
        bad = []
        for i, m in index.items():
            text = (SITE / ('index.html' if i == 'home' else m['path'] + '.html')).read_text(encoding='utf-8')
            main = text[text.index('<main'):text.index('</main>')]
            ld = re.findall(r'<script type="application/ld\+json">(.*?)</script>', text, re.S)
            try: parsed = [json.loads(x) for x in ld]
            except ValueError: parsed = []
            if len(re.findall(r'<h1[\s>]', main)) != 1 or len(re.findall(r'<main[\s>]', text)) != 1 or len(parsed) != 1 or not 70 <= len(m['desc']) <= 160:
                bad.append(i)
            if i in framed and len(re.search(r'<code id="site-src-code">(.*?)</code>', text, re.S).group(1)) < 200:
                bad.append(i + ' (no code)')
        check('every page has one h1, one main, one block of structured data that parses, a description of 70 to 160 characters, and every block its code', not bad, bad[:6])
        leftover = []
        for f in list(SITE.rglob('*.html')) + list((SITE / '_').rglob('*.js')):
            leftover += [(f.name, m.group(1)) for m in re.finditer(r'href=\\?"#([a-z0-9-]+)', f.read_text(encoding='utf-8')) if m.group(1) in index]
        check('no link between pages is left as a #: every one goes by address', not leftover, leftover[:5])
        st = {where: answer(url + where)[:2] for where in ('', 'docs', 'components/lightbox', 'components/lightbox/', 'components/lightbox.html', 'charts/usage', 'index.html')}
        check('the host answers each address with its page, and sends the same address with a slash or .html to the one address', st == {
              '': (200, None), 'docs': (200, None), 'components/lightbox': (200, None), 'components/lightbox/': (307, '/components/lightbox'),
              'components/lightbox.html': (307, '/components/lightbox'), 'charts/usage': (200, None), 'index.html': (307, '/')}, st)
        miss = answer(url + 'components/no-such-thing')
        check('an address with no page answers 404, with the page that says so and the way back', miss[0] == 404 and 'There is no page at this address' in miss[2] and 'href="/components"' in miss[2], miss[:2])
        sitemap = (SITE / 'sitemap.xml').read_text(encoding='utf-8') if (SITE / 'sitemap.xml').exists() else ''
        check('the sitemap lists every address', sitemap.count('<loc>') == len(index) and f'<loc>{site["site"]}/components/lightbox</loc>' in sitemap, sitemap.count('<loc>'))
        bare = b.new_context(viewport={'width': 1440, 'height': 900}, java_script_enabled=False); bp = bare.new_page()
        bp.goto(url + 'components/lightbox', wait_until='load')
        check('a page opened straight shows itself, its sidebar and its section before any script runs', bp.locator('#site-view h1').is_visible() and bp.inner_text('#site-view h1') == 'Lightbox' and bp.title() == lb['head']
              and bp.locator('#site-nav [aria-current="page"]').inner_text() == 'Lightbox' and bp.locator('#site-sections [aria-current="page"]').inner_text() == 'Components'
              and bp.locator('.tray-gallery img').count() == 6, bp.title())
        bare.close()
        go(pg, 'c-button'); pg.wait_for_timeout(400)
        check('opening a page puts its address in the address bar, with no #', pg.evaluate('location.pathname + location.search + location.hash') == '/components/button' and pg.title() == index['c-button']['head'], pg.url)
        pg.evaluate('window.scrollTo(0, 700)'); pg.wait_for_timeout(100); y = pg.evaluate('window.scrollY')
        pg.locator('#site-nav a[href="/components/card"]').click(); pg.wait_for_timeout(400)
        moved = [pg.evaluate('location.pathname'), pg.evaluate('window.scrollY')]
        pg.go_back(); pg.wait_for_timeout(500)
        back = [pg.evaluate('location.pathname'), pg.evaluate('window.scrollY'), pg.inner_text('#site-view h1')]
        pg.go_forward(); pg.wait_for_timeout(500)
        fwd = [pg.evaluate('location.pathname'), pg.inner_text('#site-view h1')]
        check('Back returns to the page before, at the place it was left, and Forward goes on again', y > 0 and moved == ['/components/card', 0] and back == ['/components/button', y, 'Button']
              and fwd == ['/components/card', 'Card'], (y, moved, back, fwd))
        with ctx.expect_page() as tab:
            pg.locator('#site-nav a[href="/components/badge"]').click(modifiers=['ControlOrMeta'])
        t = tab.value; t.wait_for_load_state('load'); t.wait_for_timeout(300)
        check('a click with Ctrl or Command opens the page in a new tab, at its address, and leaves this one as it is', t.evaluate('location.pathname') == '/components/badge'
              and t.inner_text('#site-view h1') == 'Badge' and here(pg) == 'c-card', t.url)
        t.close()
        pg.goto(url + '#c-button', wait_until='load'); pg.wait_for_timeout(800)
        check('a link of the old kind, /#c-button, lands on the page at its address', pg.evaluate('location.pathname + location.hash') == '/components/button' and pg.inner_text('#site-view h1') == 'Button', pg.url)
        fp = ctx.new_page()
        fp.set_content(f'<iframe src="{url}" style="width: 1280px; height: 800px; border: 0"></iframe>'); fp.wait_for_timeout(1500)
        fr = fp.frames[1]
        links = fr.evaluate("[window.TRAY_SITE.paths, document.querySelector('.site-top .site-logo').getAttribute('href'), document.querySelector('#site-sections .tray-tab').getAttribute('href')]")
        fr.locator('.tray-hero__actions .tray-btn').first.click(); fr.wait_for_timeout(700)
        opened = fr.evaluate("[location.hash, document.querySelector('#site-view h1').textContent, document.querySelector('.site-prose a[download]').getAttribute('href')]")
        fr.evaluate('location.hash = "c-lightbox"'); fr.wait_for_timeout(1000)
        pics = fr.evaluate("[...document.querySelectorAll('.tray-gallery img')].map(i => [i.getAttribute('src').startsWith('assets/'), i.complete && i.naturalWidth > 0])")
        check('framed inside another page, pages go by #: links say #id, a link opens its page, and files and pictures are found',
              links == [False, '#home', '#d-introduction'] and opened == ['#d-installation', 'Installation', f'trayui-{site["version"]}.zip'] and len(pics) == 6 and all(p[0] for p in pics) and pics[0][1], (links, opened, pics))
        fp.close()

        # ---------- every page ----------
        bad = []
        def looks(i):
            state = pg.evaluate('''() => ({ h: document.querySelector('#site-view h1')?.textContent, cur: document.querySelector('#site-nav [aria-current="page"]')?.getAttribute('href') ?? null,
                                      over: document.documentElement.scrollWidth - document.documentElement.clientWidth, stage: document.querySelector('.site-stage')?.children.length ?? -1,
                                      busy: document.querySelector('#site-view').hasAttribute('aria-busy') })''')
            wrong = not state['h'] or state['over'] > 1 or state['stage'] == 0 or state['busy'] or (i != 'home' and state['cur'] != '/' + index[i]['path'])
            if i in framed:
                f = pg.evaluate(FRAME_JS)
                if not f or f['kids'] < 2 or not f['styled'] or not f['wired'] or f['over'] > 1:
                    wrong = True; state['frame'] = f
            return wrong, state
        for i in every:
            go(pg, i); pg.wait_for_timeout(450 if i in framed else 250 if i in chart_pages else 70)
            wrong, state = looks(i)
            if wrong:  # a page still on its way on a busy machine gets one more look
                pg.wait_for_timeout(1500); wrong, state = looks(i)
            if wrong:
                bad.append((i, state))
        check(f'all {len(every)} pages render at 1440px without sideways scroll, and every block is live in its frame', not bad, bad[:4])
        check('no script errors or failed requests while visiting every page', not errors, errors[:4])

        # ---------- a component page ----------
        go(pg, 'c-button'); pg.wait_for_timeout(150)
        check('a component page shows its example, markup tab and guidelines', pg.locator('.site-stage .tray-btn').count() > 3 and pg.locator('#site-t2').count() == 1 and pg.locator('.site-prose h2').count() >= 2)
        check('the tab title, the description and the canonical address follow the page', pg.title() == index['c-button']['head']
              and pg.get_attribute('link[rel="canonical"]', 'href') == f'{site["site"]}/components/button' and pg.get_attribute('meta[name="description"]', 'content') == index['c-button']['desc'], pg.title())
        pg.screenshot(path=str(SHOTS / 'button.png'), full_page=True)
        # the playground under the example
        pg.wait_for_selector('[data-play-stage] .tray-btn', timeout=8000)
        play = lambda: pg.evaluate("[document.querySelector('[data-play-stage] .tray-btn').className, document.querySelector('[data-play-code]').textContent]")
        first = play()
        pg.locator('[data-play-code]').scroll_into_view_if_needed(); pg.wait_for_timeout(500)
        check('the markup of a playground is coloured once it comes into view and code.js arrives', 'code.js' in asked and pg.locator('[data-play-code] .hljs-name').count() >= 1, pg.inner_html('[data-play-code]')[:120])
        check('the playground draws the button as it starts, with its markup under it', first[0] == 'tray-btn tray-btn--md' and first[1].startswith('<button class="tray-btn tray-btn--md" type="button">'), first)
        pg.locator('.site-play__controls select').first.select_option(' tray-btn--quiet')
        pg.locator('.site-play__controls label:has-text("Only")').click()
        pg.locator('.site-play__controls input.tray-input').fill('Find <b>'); pg.wait_for_timeout(100)
        after = play()
        check('choosing changes the button and its markup together, and a text is written as text', 'tray-btn--quiet' in after[0] and 'tray-btn--icon' in after[0] and 'aria-label="Find &lt;b&gt;"' in after[1], after)
        pg.locator('.site-play__controls label:has-text("Ink")').click(); pg.wait_for_timeout(80)
        check('the ground changes the stage and leaves the markup as it was', pg.locator('[data-play-stage] .tray-card--inverse .tray-btn').count() == 1 and pg.inner_text('[data-play-code]') == after[1])
        pg.locator('.site-play [data-tray="copy"]').click(); pg.wait_for_timeout(200)
        check('the markup of the playground can be copied whole', pg.evaluate('navigator.clipboard.readText()') == after[1])
        pg.locator('[data-play-reset]').click(); pg.wait_for_timeout(80)
        check('"Start again" puts every control back', play() == first and pg.locator('[data-play-stage] .tray-card').count() == 0 and pg.input_value('.site-play__controls input.tray-input') == 'Order a jar')
        pg.locator('.site-play').screenshot(path=str(SHOTS / 'playground.png'))
        plays, undrawn = sorted(f.stem for f in (ROOT / 'tools' / 'site' / 'play').glob('*.json')), []
        for name in plays:
            ident = 'c-' + re.sub(r'(?<=[a-z0-9])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])', '-', name).lower()
            go(pg, ident)
            try:
                pg.wait_for_selector('[data-play-stage] .site-play__ground > *', timeout=5000)
            except Exception:
                undrawn.append(name); continue
            if not pg.inner_text('[data-play-code]').strip() or pg.evaluate('document.documentElement.scrollWidth - document.documentElement.clientWidth') > 1:
                undrawn.append(name)
        check(f'each of the {len(plays)} playgrounds draws its component and its markup, and the page does not scroll sideways', len(plays) >= 2 and not undrawn, undrawn)
        go(pg, 'c-button'); pg.wait_for_timeout(150)
        pg.click('#site-t2'); pg.wait_for_timeout(80)
        code = pg.inner_text('#site-src-code')
        check('the markup tab shows the example\'s source, one element to a line', pg.locator('#site-src').is_visible() and code.count('\n') > 5 and '<button class="tray-btn' in code, code[:80])
        pg.click('#site-t1')
        pg.locator('.site-pager__next').click(); pg.wait_for_timeout(120)
        check('"Next" goes to the following component and moves focus to its title', here(pg) == 'c-button-group' and pg.evaluate('document.activeElement.tagName') == 'H1' and pg.evaluate('window.scrollY') == 0)
        go(pg, 'c-tabs'); pg.wait_for_timeout(150)
        pg.click('#tt2'); check('a component\'s behaviour runs on its page', pg.is_visible('#tp2'))
        pg.locator('.site-stage a[href="#"]').first.click(); pg.wait_for_timeout(60)
        check('a link inside an example does not leave the page', here(pg) == 'c-tabs')
        go(pg, 'c-chart'); pg.wait_for_timeout(300)
        check('previews that draw with a script are drawn', pg.locator('.site-stage .tray-chart svg').count() >= 4, pg.locator('.site-stage .tray-chart svg').count())
        go(pg, 'c-checkbox'); pg.wait_for_timeout(120)
        check('a preview\'s own script runs', pg.evaluate('document.getElementById("k-ind").indeterminate') is True)
        go(pg, 'c-dropdown-menu'); pg.wait_for_timeout(150)
        room = pg.evaluate('''() => { const s = document.querySelector('.site-stage').getBoundingClientRect(); return Math.max(...[...document.querySelectorAll('.site-stage .tray-pop:not([hidden])')].map(p => p.getBoundingClientRect().bottom)) - s.bottom; }''')
        check('an open menu stays inside the example frame', room <= 1, room)
        go(pg, 'components'); pg.wait_for_timeout(120)
        check('the components page lists every component, group by group', pg.locator('.site-group a').count() == len(comps) - 1 and pg.locator('.site-group').count() == 15, pg.locator('.site-group a').count())
        pg.evaluate('location.hash = "sidebar"'); pg.wait_for_timeout(100)
        check('a # that names no page changes nothing: it is a part of the page', pg.locator('#site-view h1').inner_text() == 'Components' and here(pg) == 'components')

        # ---------- the docs and the foundations ----------
        go(pg, 'g-behaviour'); pg.wait_for_timeout(120)
        check('a guide renders its table and code', pg.locator('.site-prose table tbody tr').count() > 40 and pg.locator('.site-prose .tray-code').count() >= 1)
        go(pg, 'g-brand'); pg.wait_for_timeout(120)
        check('the brand book is a page of the docs', pg.locator('.site-prose h2').count() >= 8 and pg.locator('.site-prose .site-h3').count() >= 1)
        go(pg, 'd-introduction'); pg.wait_for_timeout(120)
        pg.locator('.site-prose a[href="/docs/brand-book"]').first.click(); pg.wait_for_timeout(120)
        check('a link in the docs goes to the page it names', here(pg) == 'g-brand')
        go(pg, 'f-colours'); pg.wait_for_timeout(150)
        sw = pg.evaluate("[...document.querySelectorAll('.site-tokens tbody tr')].map(r => [...r.querySelectorAll('.site-swatch')].map(s => getComputedStyle(s).backgroundColor))")
        n_colours = len(json.loads((ROOT / 'project' / 'tokens.json').read_text(encoding='utf-8'))['color']['tokens'])
        check(f'the colours page shows every colour token in both themes ({n_colours})', len(sw) == n_colours and all(len(r) == 2 for r in sw) and sw[0][0] != sw[0][1], (len(sw), sw[:1]))
        pg.screenshot(path=str(SHOTS / 'colours.png'))
        go(pg, 'f-type'); pg.wait_for_timeout(150)
        check('the typography page sets a sample in every style', pg.locator('.site-type').count() == 15 and pg.evaluate("getComputedStyle(document.querySelector('.site-type__sample.display')).fontWeight") == '700')
        go(pg, 'f-scale'); pg.wait_for_timeout(150)
        check('the scale page lists space, corners, sizes and the rest', pg.locator('.site-tokens').count() >= 8 and pg.locator('.site-bar').count() >= 19)
        go(pg, 'f-icons'); pg.wait_for_timeout(200)
        n_icons = pg.locator('[data-icon]').count()
        pg.fill('[data-icon-filter]', 'arrow')
        narrowed = pg.locator('[data-icon]:visible').count()
        check('the icons page shows every icon and its search narrows them', n_icons == len(json.loads((ROOT / 'src' / 'icons.json').read_text(encoding='utf-8'))) and 4 <= narrowed <= 8, (n_icons, narrowed))
        pg.locator('[data-icon="arrow-right"]').click(); pg.wait_for_timeout(250)
        clip = pg.evaluate('navigator.clipboard.readText()')
        check('choosing an icon copies its markup and says so', clip == '<svg class="tray-icon" aria-hidden="true"><use href="#tray-i-arrow-right"/></svg>' and pg.locator('.tray-toast').count() == 1, clip)
        pg.screenshot(path=str(SHOTS / 'icons.png'))
        pg.fill('[data-icon-filter]', 'zzz'); check('the icon search says when nothing matches', pg.locator('[data-icon-empty]').is_visible())

        # ---------- blocks ----------
        go(pg, 'blocks'); pg.wait_for_timeout(700)
        check('the Blocks link opens the gallery and the sidebar lists the blocks, after the gallery and the two pages that gather sign-in pages and sidebars',
              pg.inner_text('#site-view h1') == 'Blocks' and pg.locator('#site-nav .tray-sidebar__item').count() == len(block_ids) + 3
              and pg.locator('#site-sections [aria-current="page"]').inner_text() == 'Blocks', pg.locator('#site-nav .tray-sidebar__item').count())
        check('the gallery has a picture for every block', pg.locator('[data-thumb]').count() == len(block_ids), pg.locator('[data-thumb]').count())
        go(pg, 'b-login'); pg.wait_for_timeout(500)
        logins = [i for i in block_ids if i.startswith(('b-login-', 'b-signup-'))]
        check('the page of sign-in and sign-up pages shows each of them, and nothing else', pg.inner_text('#site-view h1') == 'Sign-in and sign-up pages'
              and sorted(pg.eval_on_selector_all('#site-view .site-thumb', 'as => as.map(a => a.getAttribute("href"))')) == sorted('/' + index[i]['path'] for i in logins), len(logins))
        go(pg, 'blocks'); pg.wait_for_timeout(500)
        check('the pictures in view are live and cannot take the keyboard', pg.locator('[data-thumb] iframe').count() >= 3 and pg.locator('[data-thumb] iframe:not([inert])').count() == 0, pg.locator('[data-thumb] iframe').count())
        pg.screenshot(path=str(SHOTS / 'blocks.png'))
        pg.locator('.site-thumb').first.click(); pg.wait_for_timeout(600)
        check('a picture opens its block', here(pg) == block_ids[0])
        go(pg, 'b-sidebar-01'); pg.wait_for_timeout(600)
        size = lambda: pg.evaluate("(() => { const f = document.querySelector('.site-frame iframe'); return [f.contentWindow.innerWidth, Math.round(f.getBoundingClientRect().width), f.contentDocument.querySelector('.tray-app__side').offsetParent !== null]; })()")
        d = size()
        check('a block opens at desktop width, scaled to the room there is', d[0] >= 1280 and d[1] <= pg.evaluate("document.querySelector('.site-frame').clientWidth") and d[2], d)
        pg.screenshot(path=str(SHOTS / 'block.png'))
        pick(pg, '.site-viewer__sizes input[value="tablet"]'); pg.wait_for_timeout(250); t = size()
        pick(pg, '.site-viewer__sizes input[value="phone"]'); pg.wait_for_timeout(250); ph = size()
        check('Tablet and Phone lay the block out at 768 and 390, where its sidebar gives way', t[0] == 768 and ph[0] == 390 and not t[2] and not ph[2], (t, ph))
        frame = pg.frame_locator('.site-frame iframe')
        frame.locator('.tray-app__menu').click(); pg.wait_for_timeout(350)
        check('inside the frame the menu button opens the sidebar in a sheet', frame.locator('dialog.tray-sheet--nav[open] .tray-sidebar__item').count() > 5)
        frame.locator('dialog.tray-sheet--nav .tray-sidebar__item').first.click(); pg.wait_for_timeout(300)
        check('a link inside a frame closes the sheet and leaves the frame where it is', frame.locator('dialog.tray-sheet--nav[open]').count() == 0 and frame.locator('.tray-app__main').count() == 1 and here(pg) == 'b-sidebar-01')
        pg.click('[data-full]'); pg.wait_for_timeout(500)
        fs = pg.evaluate("(() => { const d = document.getElementById('site-full'), f = d.querySelector('iframe'); return [d.open, f.contentWindow.innerWidth, Math.round(d.getBoundingClientRect().width), document.querySelector('#site-full input:checked').value]; })()")
        check('"Full size" shows the same frame over the whole window, at the width chosen', fs[0] and fs[1] == 390 and fs[2] == 1440 and fs[3] == 'phone', fs)
        pick(pg, '#site-full input[value="desktop"]'); pg.wait_for_timeout(250)
        wide = pg.evaluate("document.querySelector('#site-full iframe').contentWindow.innerWidth")
        check('at full size Desktop is as wide as the window allows, not scaled', wide > 1380, wide)
        pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
        check('Escape closes the full-size view', not pg.evaluate("document.getElementById('site-full').open") and pg.locator('#site-full iframe').count() == 0)
        pg.click('#site-t2'); pg.wait_for_timeout(120)
        code = pg.inner_text('#site-src-code')
        check('the Code tab shows the whole page as it is written', code.startswith('<!doctype html>') and '<link rel="stylesheet" href="../tokens.css">' in code and code.rstrip().endswith('</html>'), code[:60])
        check('the width switch is for the preview only', pg.locator('.site-viewer__sizes').is_hidden() and pg.locator('.site-viewer [data-tray="copy"]').is_visible())
        pg.click('#site-t1')
        pg.locator('.site-pager__next').click(); pg.wait_for_timeout(500)
        check('"Next" goes to the following block', here(pg) == block_ids[block_ids.index('b-sidebar-01') + 1], here(pg))


        # ---------- charts ----------
        DRAWN = '''() => [...document.querySelectorAll('#site-view [data-rechart]')].map(h => { const svg = h.querySelector('svg.recharts-surface'), c = h.querySelector('.tray-chart__canvas');
          return { id: h.getAttribute('data-rechart'), drawn: !!svg, box: c ? Math.round(c.getBoundingClientRect().width) : 0, svg: svg ? Number(svg.getAttribute('width')) : 0 }; })'''
        def walk():
            """Scroll through the page so every chart comes into view and is drawn."""
            height = pg.evaluate('document.documentElement.scrollHeight')
            for y in range(0, height, 600):
                pg.evaluate(f'window.scrollTo(0, {y})'); pg.wait_for_timeout(110)
            pg.wait_for_timeout(500)
        go(pg, 'charts'); pg.wait_for_timeout(900)
        check('the Charts link opens the overview and the sidebar lists the forms', pg.inner_text('#site-view h1') == 'Charts' and pg.locator('#site-nav .tray-sidebar__item').count() == len(chart_pages)
              and pg.locator('#site-sections [aria-current="page"]').inner_text() == 'Charts' and 'pages/charts.js' in asked, pg.locator('#site-nav .tray-sidebar__item').count())
        check('the overview draws the charts in view', pg.locator('#site-view [data-rechart] svg.recharts-surface').count() >= 3, pg.locator('#site-view [data-rechart] svg.recharts-surface').count())
        pg.screenshot(path=str(SHOTS / 'charts.png'))
        total, undrawn, misfit = 0, [], []
        for i in chart_pages:
            go(pg, i); pg.wait_for_timeout(300)
            walk()
            for c in pg.evaluate(DRAWN):
                total += 1
                if not c['drawn']: undrawn.append((i, c['id']))
                elif abs(c['svg'] - c['box']) > 2: misfit.append((i, c))
        n_examples = len(list((ROOT / 'react' / 'examples' / 'charts').glob('*.tsx')))
        check(f'every chart on every page of the section is drawn, at the width of its card ({n_examples} examples)', n_examples >= 50 and total > n_examples and not undrawn and not misfit, (total, undrawn[:4], misfit[:4]))
        go(pg, 'ch-bar'); pg.wait_for_timeout(700); walk(); pg.evaluate('window.scrollTo(0, 0)')
        check('a page of one form shows each example under its name, with its code folded under it', pg.inner_text('#site-view h1') == 'Bar charts' and pg.locator('.site-chart').count() == pg.locator('.site-chart__code').count() >= 8
              and pg.locator('.site-chart--wide').count() == 1, pg.locator('.site-chart').count())
        fill = lambda: pg.evaluate("getComputedStyle(document.querySelector('[data-rechart=\"bar-default\"] .recharts-bar-rectangle path')).fill")
        ink = fill()
        check('one series is drawn in ink, and the tick text in hint grey', ink == pg.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--ink').trim().replace(/^#141414$/, 'rgb(20, 20, 20)')")
              and pg.evaluate("getComputedStyle(document.querySelector('[data-rechart=\"bar-default\"] .recharts-cartesian-axis-tick-value')).fill") == 'rgb(110, 108, 102)', ink)
        colours = pg.evaluate("[...document.querySelectorAll('[data-rechart=\"bar-multiple\"] .recharts-bar')].map(b => getComputedStyle(b.querySelector('.recharts-bar-rectangle path')).fill)")
        check('two series take the first two data colours, and the chart has a key and a table of figures', colours == ['rgb(37, 106, 191)', 'rgb(235, 104, 52)']
              and pg.locator('[data-rechart="bar-multiple"] .tray-chart__legend li').all_inner_texts() == ['2026', '2025'] and pg.locator('[data-rechart="bar-multiple"] details table tbody tr').count() == 8, colours)
        pg.evaluate("document.querySelector('[data-rechart=\"bar-stacked\"]').scrollIntoView({ block: 'center' })"); pg.wait_for_timeout(200)
        box = pg.locator('[data-rechart="bar-stacked"] .recharts-wrapper').bounding_box()
        pg.mouse.move(box['x'] + box['width'] * .5, box['y'] + box['height'] * .5); pg.wait_for_timeout(250)
        tip = pg.locator('[data-rechart="bar-stacked"] .tray-tip')
        check('pointing at a chart shows the system\'s tooltip: the category, each series in the order of the key, and the total',
              tip.count() == 1 and tip.is_visible() and [r.split('\n')[0] for r in tip.locator('.tray-tip__row').all_inner_texts()] == ['Jars', 'Restaurants', 'Farm shop', 'Total']
              and tip.locator('.tray-swatch').count() == 3, tip.all_inner_texts())
        pg.mouse.move(0, 0)
        pg.evaluate("document.querySelector('[data-rechart=\"bar-default\"]').scrollIntoView({ block: 'center' })"); pg.wait_for_timeout(200)
        pg.locator('[data-rechart="bar-default"] svg.recharts-surface').focus(); pg.keyboard.press('ArrowRight'); pg.keyboard.press('ArrowRight'); pg.wait_for_timeout(250)
        check('the plot takes the keyboard: the arrows move the tooltip from point to point', pg.locator('[data-rechart="bar-default"] .tray-tip').is_visible()
              and pg.locator('[data-rechart="bar-default"] .tray-tip').inner_text().endswith(' kg'), pg.locator('[data-rechart="bar-default"] .tray-tip').all_inner_texts())
        pg.evaluate("document.querySelector('[data-rechart=\"bar-interactive\"]').scrollIntoView({ block: 'center' })"); pg.wait_for_timeout(200)
        before = pg.get_attribute('[data-rechart="bar-interactive"] .tray-chart__canvas', 'aria-label')
        pg.locator('[data-rechart="bar-interactive"] .tray-seg__item', has_text='Restaurants').click(); pg.wait_for_timeout(400)
        after = pg.get_attribute('[data-rechart="bar-interactive"] .tray-chart__canvas', 'aria-label')
        check('a control in an example works: the switch changes the series, and the summary a screen reader hears', 'the farm shop' in before and 'restaurants' in after and before != after, after)
        code = pg.locator('.site-chart:has([data-rechart="bar-stacked"]) .site-chart__code')
        code.locator('summary').click(); pg.wait_for_timeout(300)
        shown = code.locator('pre').inner_text()
        check('"Code" under a chart opens the example\'s file, which the page already holds', code.evaluate('d => d.open')
              and shown.startswith("import { Bar, BarChart") and "from 'trayui-react/charts'" in shown and 'export function BarStacked()' in shown, shown[:60])
        pg.screenshot(path=str(SHOTS / 'chart-code.png'))
        code.locator('[data-tray="copy"]').click(); pg.wait_for_timeout(250)
        check('the code can be copied whole', pg.evaluate('navigator.clipboard.readText()').strip() == shown.strip())
        go(pg, 'ch-pie'); pg.wait_for_timeout(600); walk()
        pg.evaluate("document.querySelector('[data-rechart=\"pie-active\"]').scrollIntoView({ block: 'center' })"); pg.wait_for_timeout(200)
        box = pg.locator('[data-rechart="pie-active"] .recharts-wrapper').bounding_box()
        pg.mouse.move(box['x'] + box['width'] * .5, box['y'] + box['height'] * .05); pg.wait_for_timeout(400)
        check('in a ring the middle names the part under the pointer, and the other parts fade', pg.locator('[data-rechart="pie-active"] .tray-chart__middle-label').text_content() == 'Reserve'
              and sorted(pg.evaluate("[...document.querySelectorAll('[data-rechart=\"pie-active\"] .recharts-pie-sector')].map(s => getComputedStyle(s).opacity)")) == ['0.3', '0.3', '0.3', '1'],
              pg.locator('[data-rechart="pie-active"] .tray-chart__middle').text_content())
        pg.mouse.move(0, 0)
        go(pg, 'ch-ready'); pg.wait_for_timeout(600); walk()
        check('the ready-made Chart draws its six forms, labels the peak and gives the figures as a table', pg.locator('#site-view [data-rechart] svg.recharts-surface').count() == 8
              and pg.locator('[data-rechart="ready-bar"] .recharts-label-list').text_content().replace('\u00a0', ' ') == '22 kg' and pg.locator('[data-rechart="ready-line"] details table tbody tr').count() == 9
              and pg.locator('[data-rechart="ready-donut"] .tray-chart__key tr').count() == 4, pg.locator('[data-rechart="ready-bar"] .recharts-label-list').all_text_contents())
        go(pg, 'ch-use'); pg.wait_for_timeout(200)
        check('"Using the charts" explains the parts, with code and tables', pg.locator('.site-prose h2').count() >= 8 and pg.locator('.site-prose .tray-code').count() >= 4 and pg.locator('.site-prose table').count() == 2)
        go(pg, 'c-chart'); pg.wait_for_timeout(300)
        check('leaving the section takes its charts off the page; the plain-HTML chart still draws', pg.evaluate('window.TrayCharts && document.querySelectorAll(".recharts-wrapper").length') == 0
              and pg.locator('.site-stage .tray-chart svg').count() >= 4)

        # ---------- articles ----------
        if article_ids:
            go(pg, 'articles'); pg.wait_for_timeout(200)
            shown = lambda: [p.get_attribute('id') for p in pg.locator('.site-articles [role="tabpanel"]').all() if p.is_visible()]
            pg.locator('.site-articles [role="tab"]').nth(1).click(); pg.wait_for_timeout(150)
            one_topic = shown(), pg.locator('.site-articles [role="tabpanel"]:visible a.tray-card').count()
            pg.locator('.site-articles [role="tab"]').first.click(); pg.wait_for_timeout(150)
            check('the tabs of the Articles page show one topic, and All again', len(one_topic[0]) == 1 and one_topic[1] >= 1 and shown() == ['art-all'], (one_topic, shown()))
            pg.locator('a.site-lead').click(); pg.wait_for_timeout(500)
            mark = pg.locator('.site-toc a').nth(2).get_attribute('href')
            pg.locator('.site-toc a').nth(2).click(); pg.wait_for_timeout(400)
            top = pg.evaluate(f"Math.round(document.getElementById('{mark[1:]}').getBoundingClientRect().top)")
            sticky = pg.evaluate("Math.round(document.querySelector('.site-toc').getBoundingClientRect().top)")
            check('a card opens its article, and its contents take the reader to a heading, below the header, with the contents still in sight',
                  here(pg) == article_ids[0] and pg.url.endswith(mark) and 40 < top < 160 and 0 < sticky < 160, (here(pg), pg.url, top, sticky))
            pg.go_back(); pg.wait_for_timeout(300)
            check('going back from a heading stays on the article', here(pg) == article_ids[0] and '#' not in pg.url, pg.url)

        # ---------- themes ----------
        for theme in ('light', 'dark'):
            if theme == 'dark':
                pg.click('#site-theme-btn'); pg.wait_for_timeout(200)
                listed = pg.locator('#site-theme-list [role="menuitemradio"]').count()
                pg.locator('#site-theme-list [data-value="dark"]').click(); pg.wait_for_timeout(200)
                check('the theme menu lists the ten themes; choosing Dark turns it on and leaves the menu open to try another', listed == 10 and pg.evaluate('document.documentElement.dataset.theme') == 'dark'
                      and pg.locator('#site-theme-list [aria-checked="true"]').get_attribute('data-value') == 'dark' and pg.locator('#site-theme-list').is_visible()
                      and pg.evaluate('getComputedStyle(document.documentElement).colorScheme') == 'dark', listed)
                pg.keyboard.press('Escape'); pg.wait_for_timeout(150)
            for i in ('home', 'd-installation', 'f-colours', 'f-type', 'f-icons', 'g-layouts', 'components', 'c-date-picker', 'c-pricing-table', 'blocks', 'b-login-01', 'ch-use', 'ch-bar', 'ch-pie', 'ch-ready'):
                go(pg, i); pg.wait_for_timeout(250)
                if i.startswith('ch-') and i != 'ch-use': walk(); pg.evaluate('window.scrollTo(0, 0)')
                settled(pg); low = pg.evaluate(contrast)
                check(f'text contrast on {i} [{theme}]', not low, low[:3])
        go(pg, 'ch-bar'); pg.wait_for_timeout(700); walk(); pg.evaluate('window.scrollTo(0, 0)')
        dark_ink = pg.evaluate("getComputedStyle(document.querySelector('[data-rechart=\"bar-default\"] .recharts-bar-rectangle path')).fill")
        check('the dark theme reaches the charts without drawing them again', dark_ink == 'rgb(244, 243, 240)' and dark_ink != ink, dark_ink)
        misfit = []
        for i in chart_pages:
            go(pg, i); pg.wait_for_timeout(300)
            walk()
            misfit += [(i, c) for c in pg.evaluate(DRAWN) if not c['drawn'] or abs(c['svg'] - c['box']) > 2]
        check('in the dark theme too, every chart is drawn at the width of its card', not misfit, misfit[:4])
        go(pg, 'ch-bar'); pg.wait_for_timeout(700)
        pg.screenshot(path=str(SHOTS / 'charts-dark.png'))
        go(pg, 'b-login-01'); pg.wait_for_timeout(500)
        f = pg.evaluate(FRAME_JS)
        check('the dark theme reaches the frames', f and f['theme'] == 'dark', f)
        go(pg, 'home'); pg.wait_for_timeout(500); pg.screenshot(path=str(SHOTS / 'home-dark.png'))
        pg.reload(); pg.wait_for_timeout(400)
        check('the theme is remembered across a reload', pg.evaluate('document.documentElement.dataset.theme') == 'dark')

        # ---------- every other theme, and one of the visitor's own ----------
        others = [t['id'] for t in site['themes']['list'] if t['id'] not in ('light', 'dark')]
        low = []
        for th in others:
            pg.evaluate('id => window.TRAY_SITE.theme.set(id)', th)
            for i in ('home', 'c-button', 'c-alert', 'c-data-table', 'ch-bar', 'd-themes'):
                go(pg, i); pg.wait_for_timeout(300)
                if i == 'ch-bar': walk(); pg.evaluate('window.scrollTo(0, 0)')
                settled(pg); low += [(th, i, x) for x in pg.evaluate(contrast)]
        check(f'text keeps its contrast in the other {len(others)} themes, on six kinds of page', len(others) == 8 and not low, low[:4])
        go(pg, 'd-themes'); pg.wait_for_timeout(900)
        theme_now = lambda: pg.evaluate('document.documentElement.dataset.theme')
        check('the Themes page lists every theme and marks the one the site wears', pg.locator('.site-themecard').count() == 10 and pg.locator('input[name="site-theme-pick"]:checked').get_attribute('value') == theme_now(), theme_now())
        pg.locator('.site-themecard', has_text='Mint').click(); pg.wait_for_timeout(300)
        check('choosing a theme there puts the whole site in it, and the maker starts from it', theme_now() == 'mint' and pg.evaluate('getComputedStyle(document.body).backgroundColor') == 'rgb(247, 254, 250)'
              and pg.input_value('[data-maker-base]') == 'mint' and pg.input_value('[data-seed-hex="accent"]') == '#68efaf', theme_now())
        check('the mark and the icon of the tab take the accent of the theme', pg.evaluate("getComputedStyle(document.querySelector('.site-top .site-mark__tile')).fill") == 'rgb(104, 239, 175)'
              and pg.evaluate("decodeURIComponent(document.querySelector('link[rel=icon]').href).includes('fill=\"#68efaf\"')"))
        pg.fill('[data-seed-hex="accent"]', '#ff7ad9'); pg.wait_for_timeout(200)
        check('a colour typed into the maker redraws its preview, and the rules still hold', pg.evaluate("getComputedStyle(document.querySelector('[data-maker-preview] .tray-btn')).backgroundColor") == 'rgb(255, 122, 217)'
              and 'All 66 rules hold' in pg.inner_text('[data-maker-verdict]'), pg.inner_text('[data-maker-verdict]')[:60])
        pg.fill('[data-seed-hex="ink"]', '#7a8a80'); pg.wait_for_timeout(200)
        verdict = pg.inner_text('[data-maker-verdict]')
        check('an ink too close to the page is reported, with the rule it misses', 'missed' in verdict and 'ink on page' in verdict, verdict[:120])
        pg.fill('[data-seed-hex="ink"]', 'zz'); pg.wait_for_timeout(100)
        check('what is not a colour is marked and changes nothing', pg.get_attribute('[data-seed-hex="ink"]', 'aria-invalid') == 'true' and '--ink: #7a8a80' in pg.evaluate("document.getElementById('site-draft-theme').textContent"))
        pg.fill('[data-seed-hex="page"]', '#0b1020'); pg.fill('[data-seed-hex="ink"]', '#f2f7fd'); pg.fill('[data-maker-name-input]', 'Candy night'); pg.wait_for_timeout(250)
        pg.evaluate("(() => { const r = document.querySelector('[data-maker-round]'); r.value = 50; r.dispatchEvent(new Event('input', { bubbles: true })); })()"); pg.wait_for_timeout(150)
        css = pg.inner_text('#site-theme-css')
        check('a dark page makes a dark theme: the tray follows it, and the CSS names the theme, its scheme, its shadow and its corners',
              css.startswith('[data-theme="candy-night"] {') and 'color-scheme: dark;' in css and '--accent: #ff7ad9;' in css and '--shadow-float:' in css and '--radius-card: 20px;' in css
              and 'All 66 rules hold' in pg.inner_text('[data-maker-verdict]') and pg.input_value('[data-seed-hex="surface"]') != '#e7f3ec', (css[:80], pg.input_value('[data-seed-hex="surface"]')))
        pg.locator('[data-maker-use]').click(); pg.wait_for_timeout(400)
        accent_now = lambda: pg.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()")
        check('"Use on this site" puts the site in the new theme and adds it to the menu', theme_now() == 'candy-night' and accent_now() == '#ff7ad9'
              and pg.locator('#site-theme-list [data-value="candy-night"][aria-checked="true"]').count() == 1, (theme_now(), accent_now()))
        pg.reload(); pg.wait_for_timeout(1500)
        if not pg.locator('#site-view h1').count(): pg.reload(); pg.wait_for_timeout(1500)
        check('the visitor\'s theme survives a reload, and the maker is as it was left', theme_now() == 'candy-night' and accent_now() == '#ff7ad9' and pg.input_value('[data-maker-name-input]') == 'Candy night', (theme_now(), accent_now()))
        pg.screenshot(path=str(SHOTS / 'themes-own.png'))
        go(pg, 'b-dashboard-01'); pg.wait_for_timeout(1800)
        f = pg.evaluate("(() => { const d = document.querySelector('.site-frame iframe').contentDocument; return [d.documentElement.dataset.theme, getComputedStyle(d.documentElement).getPropertyValue('--accent').trim()]; })()")
        check('a block in its frame wears the visitor\'s theme too', f == ['candy-night', '#ff7ad9'], f)
        go(pg, 'd-themes'); pg.wait_for_timeout(900)
        pg.locator('[data-maker-forget]').click(); pg.wait_for_timeout(300)
        check('"Take it off this site" returns to Light, removes it from the menu and keeps the work in the maker', theme_now() == 'light' and pg.locator('#site-theme-list [data-value="candy-night"]').count() == 0
              and pg.input_value('[data-maker-name-input]') == 'Candy night', theme_now())
        shared = pg.inner_text('#site-theme-link')
        check('the link to a theme holds its name, its four colours and its corners, and leads to the Themes page',
              '/docs/themes?theme=Candy+night&' in shared and 'colours=0b1020-' in shared and 'ff7ad9' in shared and 'corners=50' in shared, shared)
        other = b.new_context(viewport={'width': 1280, 'height': 900}, reduced_motion='reduce'); op = other.new_page(); oerr = []
        op.on('pageerror', lambda e: oerr.append(str(e)[:200]))
        op.goto(shared, wait_until='load'); op.wait_for_selector('[data-maker-shared] .tray-alert', timeout=10000); op.wait_for_timeout(200)
        check('opened in another browser, the link fills the maker and says so; the site keeps its own theme and the address goes back to the page',
              op.input_value('[data-seed-hex="accent"]') == '#ff7ad9' and op.input_value('[data-maker-name-input]') == 'Candy night' and 'came with the link' in op.inner_text('[data-maker-shared]')
              and op.evaluate('location.pathname + location.search + location.hash') == '/docs/themes' and op.evaluate('document.documentElement.dataset.theme') == 'light', (op.evaluate('location.href'), op.input_value('[data-seed-hex="accent"]')))
        op.locator('[data-shared-use]').click(); op.wait_for_timeout(300)
        check('one press there wears it on the whole site, corners and all', op.evaluate('document.documentElement.dataset.theme') == 'candy-night'
              and op.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--radius-card').trim()") == '20px' and op.inner_text('[data-maker-shared]').strip() == '')
        go(op, 'd-themes', 'theme=Broken&colours=12'); op.wait_for_selector('[data-maker-shared] .tray-alert--danger', timeout=8000)
        check('a link cut short is reported, and the maker keeps its work', 'no theme the maker can read' in op.inner_text('[data-maker-shared]') and op.input_value('[data-seed-hex="accent"]') == '#ff7ad9')
        check('no script errors while opening theme links', not oerr, oerr[:3])
        other.close()
        pg.locator('[data-maker-random]').click(); pg.wait_for_timeout(250)
        check('"Surprise me" makes a theme that holds every rule', 'All 66 rules hold' in pg.inner_text('[data-maker-verdict]'), pg.inner_text('[data-maker-verdict]')[:100])
        pg.locator('[data-maker-reset]').click(); pg.wait_for_timeout(200)
        check('"Start again" goes back to the theme of the site', pg.input_value('[data-seed-hex="accent"]') == '#ffd426' and pg.input_value('[data-maker-base]') == 'light')
        check('no script errors while changing themes', not errors, errors[:4])
        ctx.close()

        # ---------- a phone ----------
        ctx = b.new_context(viewport={'width': 390, 'height': 844}, reduced_motion='reduce', has_touch=True, is_mobile=True, device_scale_factor=2)
        pg = ctx.new_page(); perr = []
        pg.on('pageerror', lambda e: perr.append(str(e)[:200]))
        pg.goto(url + 'components/button', wait_until='load'); pg.evaluate('document.fonts.ready'); pg.wait_for_timeout(500)
        check('a link straight to a component opens it', pg.inner_text('#site-view h1') == 'Button')
        check('on a phone the sidebar and the section links give way to a menu button, and the search to its icon',
              pg.locator('.tray-app__side').is_hidden() and pg.locator('#site-sections').is_hidden() and pg.locator('.tray-app__menu').is_visible()
              and pg.locator('#site-find').is_visible() and pg.locator('#site-find').bounding_box()['width'] <= 52, pg.locator('#site-find').bounding_box())
        wide = []
        for i in every:
            go(pg, i); pg.wait_for_timeout(350 if i in framed else 60)
            over = pg.evaluate('document.documentElement.scrollWidth - document.documentElement.clientWidth')
            if over > 1: wide.append((i, over))
            if i in framed:
                f = pg.evaluate(FRAME_JS)
                if not f or f['width'] != 390 or f['over'] > 1: wide.append((i, 'frame', f))
        check('no page scrolls sideways at 390px, and every block is shown as a phone would show it', not wide, wide[:8])
        go(pg, 'home'); pg.wait_for_timeout(500)
        pg.screenshot(path=str(SHOTS / 'phone-home.png'))
        pg.click('.tray-app__menu'); pg.wait_for_timeout(250)
        check('the menu button opens every section in a sheet', pg.locator('#site-sheet').evaluate('d => d.open') and pg.locator('#site-sections-sheet .tray-tab').count() == len(titles))
        pg.locator('#site-sections-sheet .tray-tab', has_text='Components').click(); pg.wait_for_timeout(300)
        check('choosing a section closes the sheet and opens it', not pg.locator('#site-sheet').evaluate('d => d.open') and pg.inner_text('#site-view h1') == 'Components')
        pg.click('.tray-app__menu'); pg.wait_for_timeout(250)
        check('inside a section the sheet lists its pages', pg.locator('#site-nav-sheet .tray-sidebar__item').count() == len(comps))
        pg.screenshot(path=str(SHOTS / 'phone-sheet.png'))
        pg.locator('#site-nav-sheet .tray-sidebar__item', has_text='Stat Card').click(); pg.wait_for_timeout(300)
        check('choosing a page closes the sheet and opens it', not pg.locator('#site-sheet').evaluate('d => d.open') and pg.inner_text('#site-view h1') == 'Stat Card')
        pg.click('#site-find'); pg.wait_for_timeout(200)
        box = pg.locator('#site-command').bounding_box()
        check('the search fits a phone', pg.evaluate("document.getElementById('site-search').open") and box['x'] >= 0 and box['x'] + box['width'] <= 390, box)
        pg.screenshot(path=str(SHOTS / 'phone-search.png'))
        pg.keyboard.press('Escape'); pg.wait_for_timeout(150)
        go(pg, 'ch-area'); pg.wait_for_timeout(900)
        head = pg.evaluate("(() => { const c = document.querySelector('[data-rechart=\"area-interactive\"] .tray-card__head'); if (!c) return null; const a = c.children[0].getBoundingClientRect(), b = c.children[1].getBoundingClientRect(); return [Math.round(b.top - a.bottom), Math.round(b.right), getComputedStyle(c.children[1]).display]; })()")
        check('on a phone a chart fits its card, and the switch in the head of a card drops below the title in one row', head and head[0] >= 0 and head[1] <= 390 and head[2] != 'grid'
              and pg.evaluate("(() => { const s = document.querySelector('[data-rechart=\"area-interactive\"] svg.recharts-surface'), c = document.querySelector('[data-rechart=\"area-interactive\"] .tray-chart__canvas'); return s && Math.abs(Number(s.getAttribute('width')) - c.getBoundingClientRect().width) <= 2; })()"), head)
        pg.screenshot(path=str(SHOTS / 'phone-charts.png'))
        code = pg.locator('.site-chart:has([data-rechart="area-default"]) .site-chart__code')
        code.locator('summary').click(); pg.wait_for_timeout(300)
        box = code.bounding_box()
        check('on a phone the code of a chart opens within the screen', code.evaluate('d => d.open') and box['x'] >= 0 and box['x'] + box['width'] <= 390, box)
        check('no script errors on a phone', not perr, perr[:3])
        b.close()
    server.shutdown()
    bad = [r for r in results if not r[1]]
    print(f'{len(results) - len(bad)} of {len(results)} checks pass; screenshots in {SHOTS}')
    for name, _, detail in bad: print(' FAIL', name, '|', detail[:300])
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
