"""Popover: README.md. It opens on click and moves focus to the first control inside; a panel of text alone becomes a
dialog named by its tray-pop__title (or its trigger), described by its tray-pop__text, and takes focus itself. Escape or a
data-close button closes it and puts focus back on the trigger; a click outside or Tab out closes it too. The trigger
reports aria-expanded and points at the panel with aria-controls; a panel with controls has no role or name of its own.
Placement: under the trigger from its start edge, tray-pop--end aligned to the end edge. Under reduced motion the panel only
fades, in 0.1s."""

POPS = '[data-tray="popover"]'


def parts(scope, i):
    p = scope.locator(POPS).nth(i)
    return p, p.locator('> button'), p.locator('> .tray-pop')


def drive(t, pg, scope, where=''):
    """The keys of the two popovers of the Share example, the same for the HTML and the React preview."""
    share, btn, panel = parts(scope, 0)
    btn.click()
    t.settle(pg)
    t.check(f'{where}a click on the trigger of the open popover closes it', not panel.is_visible() and btn.get_attribute('aria-expanded') == 'false')
    btn.click()
    f = t.focused(pg)
    t.check(f'{where}a click opens it and moves focus to the first control inside', panel.is_visible() and f['tag'] == 'input' and f['label'] == 'Link', f)
    t.eq(f'{where}the trigger reports aria-expanded="true"', btn.get_attribute('aria-expanded'), 'true')
    a = t.ax(panel)
    t.check(f'{where}a panel with controls has no role or name of its own', a['role'] in ('generic', 'none', None) and not a['name'], a)
    pg.keyboard.press('Escape')
    t.settle(pg)
    t.check(f'{where}Escape closes it and puts focus back on the trigger', not panel.is_visible() and btn.evaluate('b => b === document.activeElement'), t.focused(pg))
    btn.click()
    for _ in range(4):
        if not panel.evaluate('p => p.contains(document.activeElement)'):
            break
        pg.keyboard.press('Tab')
    t.settle(pg)
    t.check(f'{where}Tab out of the panel closes it', not panel.is_visible() and not t.lost_focus(pg), t.focused(pg))
    btn.click()
    pg.mouse.click(5, 5)
    t.settle(pg)
    t.check(f'{where}a click outside closes it', not panel.is_visible())
    # the text-only popover
    help_, hbtn, hpanel = parts(scope, 1)
    hbtn.click()
    a = t.ax(hpanel)
    t.eq(f'{where}a panel of text alone becomes a dialog named by its title and described by its text',
         (a['role'], a['name'], a['description']), ('dialog', 'Batch', 'Everything packed from one collection. The autumn batch was 412 jars.'))
    t.check(f'{where}and takes focus itself', hpanel.evaluate('p => p === document.activeElement'), t.focused(pg))
    pg.keyboard.press('Escape')
    t.settle(pg)
    t.check(f'{where}Escape closes it, focus back on its trigger', not hpanel.is_visible() and hbtn.evaluate('b => b === document.activeElement'), t.focused(pg))


def test_tree(t):
    pg = t.open()
    _, btn, panel = parts(pg, 0)
    t.eq('the trigger points at its panel with aria-controls', btn.get_attribute('aria-controls'), panel.get_attribute('id'))
    a = t.ax(btn)
    t.eq('and reports aria-expanded', (a['name'], a.get('expanded')), ('Share', True))
    t.match_tree('the open panel: its title and text, a named field and button, a switch', pg.locator(POPS).first, '''
- button "Share" [expanded]
- paragraph: Share this note
- paragraph: Anyone with the link can read it.
- textbox "Link"
- button "Copy the link"
- switch "Show the figures table" [checked]
''')
    _, hbtn, _ = parts(pg, 1)
    a = t.ax(hbtn)
    t.eq('the icon-only trigger has a name, collapsed', (a['name'], a.get('expanded')), ('What is a batch?', False))


def test_keys(t):
    pg = t.open()
    drive(t, pg, pg)


def test_named_by_trigger(t):
    pg = t.open()
    pg.evaluate('''() => { const s = document.createElement('span'); s.className = 'tray-anchor'; s.dataset.tray = 'popover'; s.id = 'np';
        s.innerHTML = '<button class="tray-btn tray-btn--quiet tray-btn--sm" type="button">Opening hours</button><div class="tray-pop tray-pop--card"><p class="tray-pop__text">Every day from 9 to 18.</p></div>';
        document.querySelector('.tray-demo').append(s); TrayUI.init(s); }''')
    pg.click('#np > button')
    a = t.ax(pg.locator('#np > .tray-pop'))
    t.eq('a panel of text with no title is a dialog named by its trigger', (a['role'], a['name'], a['description']), ('dialog', 'Opening hours', 'Every day from 9 to 18.'))
    t.settle(pg)  # the Share panel, closed by this press, fades out first: a scan mid-fade reads its text half transparent
    t.scan(pg, 'Light, a text popover open')


def test_events_and_close_button(t):
    pg = t.open()
    _, btn, panel = parts(pg, 0)
    btn.click()
    btn.click()
    ev = [(e['type'], e['target']) for e in t.events(pg) if e['type'] in ('tray:open', 'tray:close')]
    t.eq('tray:close and tray:open fire on the trigger', [e[0] for e in ev], ['tray:close', 'tray:open'])
    panel.evaluate('p => { const b = document.createElement("button"); b.type = "button"; b.className = "tray-btn"; b.dataset.close = ""; b.textContent = "Done"; p.firstElementChild.append(b); }')
    panel.get_by_role('button', name='Done').click()
    t.settle(pg)
    t.check('a data-close button closes it and puts focus back on the trigger', not panel.is_visible() and btn.evaluate('b => b === document.activeElement'), t.focused(pg))


def test_place(t):
    pg = t.open(width=1280)
    _, btn, panel = parts(pg, 0)
    b, p = btn.bounding_box(), panel.bounding_box()
    t.check('under its trigger, from its start edge', abs(p['x'] - b['x']) < 1 and p['y'] > b['y'] + b['height'], (b, p))
    t.eq('tray-pop--card is 22rem wide', round(p['width']), 352)
    _, hbtn, hpanel = parts(pg, 1)
    hbtn.click()
    b, p = hbtn.bounding_box(), hpanel.bounding_box()
    t.check('tray-pop--end aligns it to the end edge', abs((p['x'] + p['width']) - (b['x'] + b['width'])) < 1, (b, p))
    panel.evaluate('p => p.classList.add("tray-pop--top")')
    btn.click()  # the press on the other trigger closed it
    b, p = btn.bounding_box(), panel.bounding_box()
    t.check('tray-pop--top opens it upward', p['y'] + p['height'] <= b['y'], (b, p))
    pg = t.open(width=1280, rtl=True)
    _, btn, panel = parts(pg, 0)
    b, p = btn.bounding_box(), panel.bounding_box()
    t.check('right to left, from the start edge on the right', abs((p['x'] + p['width']) - (b['x'] + b['width'])) < 1, (b, p))


def test_motion(t):
    pg = t.open()
    _, hbtn, _ = parts(pg, 1)
    hbtn.click()
    anims = [a for a in t.running_animations(pg) if 'tray-pop' in str(a['target'])]
    names = {a['name'] for a in anims}
    t.check('reduced motion: the panel only fades', 'opacity' in names and not names & {'scale', 'translate'}, anims)
    t.check('in a tenth of a second', max([a['duration'] for a in anims] or [0]) <= 100, anims)


PARITY = [('.tray-demo', 'Share', '.tray-row')]


def test_parity_keys(t):
    r = t.open_react()
    drive(t, r, t.cell(r, 'Share'), 'react: ')



LOW = '''(where) => { const box = document.createElement('div'); box.id = 'low'; box.style.cssText = 'position: fixed; inset-inline-start: 24px; ' + where;
    box.innerHTML = '<span class="tray-anchor" data-tray="popover"><button class="tray-btn tray-btn--sm" type="button">Share low</button>'
      + '<div class="tray-pop tray-pop--card"><p class="tray-pop__title">Share this note</p><p class="tray-pop__text">Anyone with the link can read it.</p>'
      + '<input class="tray-input" aria-label="Low link" value="https://example.com/n/1"></div></span>';
    document.body.append(box); TrayUI.init(box); }'''


def test_side(t):
    """A panel that does not fit under its trigger, but does above it, opens upward; the next opening chooses again."""
    pg = t.open(width=1280, height=700)
    pg.evaluate(LOW, 'inset-block-end: 24px;')
    btn, panel = pg.locator('#low button'), pg.locator('#low .tray-pop')
    btn.click()
    b, p = btn.bounding_box(), panel.bounding_box()
    t.check('near the bottom of the window it opens upward', p['y'] + p['height'] <= b['y'] and panel.get_attribute('data-up') == '', (b, p))
    t.eq('the page did not scroll to it', pg.evaluate('scrollY'), 0)
    pg.keyboard.press('Escape')
    t.settle(pg)
    pg.evaluate('document.getElementById("low").style.cssText += "inset-block-end: auto; inset-block-start: 24px;"')
    btn.click()
    b, p = btn.bounding_box(), panel.bounding_box()
    t.check('moved to the top, the next opening is below again', p['y'] > b['y'] + b['height'] and not panel.evaluate('p => p.classList.contains("tray-pop--top") || p.hasAttribute("data-up")'), (b, p))
    pg.keyboard.press('Escape')
    t.settle(pg)
    pg.set_viewport_size({'width': 1280, 'height': 240})
    pg.evaluate('document.getElementById("low").style.cssText += "inset-block-start: 110px;"')
    btn.click()
    b, p = btn.bounding_box(), panel.bounding_box()
    t.check('fitting on neither side, it stays below, where the page can scroll to it', p['y'] > b['y'] + b['height'] and panel.get_attribute('data-up') is None, (b, p))
    pg.keyboard.press('Escape')
    t.settle(pg)
    pg.set_viewport_size({'width': 1280, 'height': 700})
    pg.evaluate('document.getElementById("low").style.cssText += "inset-block-start: 24px;"')
    panel.evaluate('p => p.classList.add("tray-pop--top")')
    btn.click()
    b, p = btn.bounding_box(), panel.bounding_box()
    t.check('tray-pop--top from the markup stays above, with room below', p['y'] + p['height'] <= b['y'] and panel.get_attribute('data-up') is None, (b, p))
    pg.keyboard.press('Escape')
    t.settle(pg)
    pg.set_viewport_size({'width': 1280, 'height': 900})
    t.check('and keeps its class when it closes', panel.evaluate('p => p.classList.contains("tray-pop--top")'))


INK = '''(kind) => { const card = document.createElement('section'); card.id = 'ground'; card.className = 'tray-card tray-card--' + kind;
    card.innerHTML = '<span class="tray-anchor" data-tray="menu"><button class="tray-btn tray-btn--quiet tray-btn--sm" type="button">Actions</button>'
      + '<div class="tray-pop"><div class="tray-list"><button class="tray-option" role="menuitem" type="button"><span class="tray-option__text">Duplicate</span></button>'
      + '<button class="tray-option tray-option--danger" role="menuitem" type="button"><span class="tray-option__text">Delete</span></button></div></div></span>'
      + '<span class="tray-anchor" data-tray="menu"><button class="tray-btn tray-btn--quiet tray-btn--sm" type="button">Pinned</button>'
      + '<div class="tray-pop" data-theme="dark"><div class="tray-list"><button class="tray-option" role="menuitem" type="button"><span class="tray-option__text">Archive</span></button></div></div></span>';
    document.querySelector('.tray-demo').prepend(card); TrayUI.init(card); }'''
COLOURS = '''(p) => { const o = p.querySelector('.tray-option'), d = p.querySelector('.tray-option--danger'), s = getComputedStyle(p), v = (n) => s.getPropertyValue(n).trim();
    const probe = document.createElement('i'); probe.style.color = 'var(--ink)'; document.documentElement.append(probe);
    const theme = getComputedStyle(probe).color; probe.remove();
    return { bg: s.backgroundColor, ink: getComputedStyle(o).color, danger: d ? getComputedStyle(d).color : null, scheme: s.colorScheme, theme }; }'''


def test_grounds(t):
    """A panel opened from the ink card or the yellow one reads as every other panel of the page: the theme's raised fill
    and the theme's ink, whatever the card around its trigger. data-theme on the panel still wins."""
    plain = {}
    for theme in ('light', 'dark'):
        pg = t.open(theme=theme)
        plain[theme] = pg.evaluate('() => { const s = getComputedStyle(document.documentElement); return s.getPropertyValue("--danger").trim(); }')
        for kind in ('inverse', 'accent'):
            pg.evaluate(INK, kind)
            g = pg.locator('#ground')
            btn, panel = g.locator('> span >> nth=0').locator('> button'), g.locator('> span >> nth=0').locator('> .tray-pop')
            btn.click()
            c = panel.evaluate(COLOURS)
            t.check(f'{theme}, from the {kind} card: the theme\'s raised fill and the theme\'s ink', c['ink'] == c['theme'] and c['bg'] != c['ink'] and c['scheme'] == ('dark' if theme == 'dark' else 'light'), c)
            t.check(f'{theme}, from the {kind} card: a danger item takes the theme\'s red', c['danger'] != c['ink'], c)
            t.scan(pg, f'{theme.capitalize()}, a menu open in the {kind} card', include='#ground')
            pg.keyboard.press('Escape')
            t.settle(pg)
            g.locator('> span >> nth=1').locator('> button').click()
            pinned = g.locator('> span >> nth=1').locator('> .tray-pop').evaluate('p => [getComputedStyle(p).backgroundColor, getComputedStyle(p.querySelector(".tray-option")).color]')
            t.eq(f'{theme}, from the {kind} card: a panel with data-theme="dark" stays dark', pinned, ['rgb(38, 38, 36)', 'rgb(244, 243, 240)'])
            pg.keyboard.press('Escape')
            t.settle(pg)
            pg.evaluate('document.getElementById("ground").remove()')
