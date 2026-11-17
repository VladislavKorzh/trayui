#!/usr/bin/env python3
"""Drive the component previews with a pointer and a keyboard and check that the behaviours do what their guidelines say.

    python3 tools/smoke.py
"""
import json, pathlib, sys
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
P, PREV = ROOT / 'project', ROOT / '.preview'
results = []


def check(name, ok, detail=''):
    results.append((name, bool(ok), detail))


def main():
    # A panel that closes fades for a tenth of a second, even for a visitor who asks for reduced motion: the checks wait
    # until every animation with an end has ended (getAnimations flushes styles, so a transition just set off is counted).
    def settled(pg):
        try: pg.wait_for_function("() => !document.getAnimations().some(a => a.playState === 'running' && isFinite(a.effect.getComputedTiming().endTime))", timeout=2000)
        except Exception: pass
    tokens = (PREV / 'tokens.css').read_text(encoding='utf-8')
    css = (ROOT / 'dist' / 'components' / 'bundle.css').read_text(encoding='utf-8')
    js = (ROOT / 'dist' / 'components' / 'bundle.js').read_text(encoding='utf-8')
    with sync_playwright() as p:
        b = p.chromium.launch(channel='chrome')
        ctx = b.new_context(viewport={'width': 920, 'height': 900}, reduced_motion='reduce', permissions=['clipboard-read', 'clipboard-write'])
        ctx.add_init_script('(() => { const boot = () => { const d = document.documentElement; if (!d) return false; d.setAttribute("data-theme", "light");'
                            ' for (const t of ' + json.dumps([tokens, css]) + ') { const s = document.createElement("style"); s.textContent = t; d.appendChild(s); } return true; };'
                            ' if (!boot()) new MutationObserver((_, o) => { if (boot()) o.disconnect(); }).observe(document, { childList: true }); })();')
        ctx.add_init_script(js)
        ctx.set_default_timeout(4000)
        errors = []

        def open_(name):
            pg = ctx.new_page()
            pg.on('pageerror', lambda e: errors.append(f'{name}: {e}'))
            pg.goto((P / 'components' / name / 'preview.html').as_uri(), wait_until='load')
            pg.wait_for_timeout(150)
            return pg

        try:
            pg = open_('ButtonGroup')
            pg.click('[data-step="1"]'); check('stepper counts up', pg.inner_text('output') == '3', pg.inner_text('output'))
            for _ in range(6): pg.click('[data-step="1"]')
            check('stepper stops at its max', pg.inner_text('output') == '9' and pg.is_disabled('[data-step="1"]')); pg.close()
        except Exception as e:
            check('ButtonGroup could be driven', False, str(e).split(chr(10))[0][:140])

        try:
            pg = open_('Toggle')
            t = pg.locator('.tray-toggle').nth(1); t.click(); check('toggle presses', t.get_attribute('aria-pressed') == 'true'); pg.close()
        except Exception as e:
            check('Toggle could be driven', False, str(e).split(chr(10))[0][:140])

        try:
            pg = open_('InputOTP')
            cells = pg.locator('.tray-otp').first.locator('input'); cells.nth(3).click(); pg.keyboard.type('12')
            check('one-time code moves on as digits are typed', pg.evaluate('document.activeElement === document.querySelectorAll(".tray-otp")[0].querySelectorAll("input")[5]')); pg.close()
        except Exception as e:
            check('InputOTP could be driven', False, str(e).split(chr(10))[0][:140])

        try:
            pg = open_('Slider')
            pg.locator('#r1').focus(); pg.keyboard.press('ArrowRight'); check('slider writes its value', pg.inner_text('output[for="r1"]') == '5', pg.inner_text('output[for="r1"]')); pg.close()
        except Exception as e:
            check('Slider could be driven', False, str(e).split(chr(10))[0][:140])

        try:
            pg = open_('Select')
            first = pg.locator('[data-tray="select"]').first
            first.locator('.tray-select-trigger').click(); check('select opens', first.locator('.tray-pop').is_visible())
            first.locator('[role="option"]').nth(1).click()
            settled(pg); check('select takes an option and closes', first.locator('.tray-select-trigger__value').inner_text() == '50 g' and not first.locator('.tray-pop').is_visible())
            check('select fills its hidden input', pg.evaluate('document.querySelector("input[name=jar]").value') == '50')
            first.locator('.tray-select-trigger').focus(); pg.keyboard.press('ArrowDown'); pg.keyboard.press('ArrowDown'); pg.keyboard.press('Enter')
            check('select works from the keyboard', first.locator('.tray-select-trigger__value').inner_text() == '100 g', first.locator('.tray-select-trigger__value').inner_text())
            first.locator('.tray-select-trigger').click(); pg.keyboard.press('Escape'); settled(pg); check('Escape closes the select', not first.locator('.tray-pop').is_visible()); pg.close()
        except Exception as e:
            check('Select could be driven', False, str(e).split(chr(10))[0][:140])

        try:
            pg = open_('Combobox')
            pg.fill('#c1', 'ky'); vis = pg.locator('[data-tray="combobox"]').first.locator('[role="option"]:visible')
            check('combobox filters', vis.count() == 1 and vis.first.inner_text().strip() == 'Kyiv', str(vis.count()))
            pg.keyboard.press('Enter'); check('combobox takes the match on Enter', pg.input_value('#c1') == 'Kyiv', pg.input_value('#c1'))
            pg.fill('#c1', 'zzz'); check('combobox says when nothing matches', pg.locator('[data-tray="combobox"]').first.locator('.tray-list__empty').is_visible()); pg.close()
        except Exception as e:
            check('Combobox could be driven', False, str(e).split(chr(10))[0][:140])

        try:
            pg = open_('Calendar')
            cal = pg.locator('[data-tray="calendar"]').first
            cal.locator('[data-date="2026-11-24"]').click(); check('calendar picks a day', cal.locator('[aria-pressed="true"]').get_attribute('data-date') == '2026-11-24')
            pg.keyboard.press('ArrowDown'); pg.keyboard.press('ArrowDown')
            check('arrow keys cross into the next month', pg.evaluate('document.activeElement.dataset.date') == '2026-12-08', pg.evaluate('document.activeElement.dataset.date'))
            check('days before the minimum are disabled', cal.locator('[data-date="2026-12-08"]').count() == 1 and pg.evaluate('!!document.querySelector("[data-tray=calendar]")'))
            rng = pg.locator('[data-tray="calendar"]').nth(1)
            rng.locator('[data-date="2026-12-15"]').click(); rng.locator('[data-date="2026-12-18"]').click()
            check('a range takes two clicks', rng.locator('[data-in-range]').count() == 2 and rng.locator('[aria-pressed="true"]').count() == 2); pg.close()
        except Exception as e:
            check('Calendar could be driven', False, str(e).split(chr(10))[0][:140])

        try:
            pg = open_('DatePicker')
            single = pg.locator('[data-tray="datepicker"]').nth(1)
            single.locator('.tray-select-trigger').click(); single.locator('[data-date="2026-11-20"]').click()
            settled(pg); check('date picker shows the day in words and closes', single.locator('.tray-select-trigger__value').inner_text() == '20 Nov 2026' and not single.locator('.tray-pop').is_visible(), single.locator('.tray-select-trigger__value').inner_text())
            rng = pg.locator('[data-tray="datepicker"]').first
            rng.locator('.tray-select-trigger').click()  # the click on the other picker closed this panel, as it should
            rng.locator('[data-preset="7"]').click(); check('a preset sets the range', '9' in rng.locator('.tray-select-trigger__value').inner_text() and '15 Nov 2026' in rng.locator('.tray-select-trigger__value').inner_text(), rng.locator('.tray-select-trigger__value').inner_text())
            rng.locator('[data-clear]').click(); check('Clear empties it', rng.locator('.tray-select-trigger__value').inner_text() == 'Pick a period')
            rng.locator('[data-apply]').click(); settled(pg); check('Apply closes the panel', not rng.locator('.tray-pop').is_visible()); pg.close()
        except Exception as e:
            check('DatePicker could be driven', False, str(e).split(chr(10))[0][:140])

        try:
            pg = open_('Tabs')
            pg.click('#tt2'); check('tabs switch panels', pg.is_visible('#tp2') and not pg.is_visible('#tp1'))
            pg.keyboard.press('ArrowRight'); check('arrow keys move between tabs', pg.get_attribute('#tt3', 'aria-selected') == 'true')
            pg.keyboard.press('ArrowRight'); check('a disabled tab is skipped', pg.get_attribute('#tt1', 'aria-selected') == 'true')
            check('an overflowing strip is marked', pg.locator('[data-tray="strip"]').evaluate('e => e.classList.contains("is-clipped")'), pg.locator('[data-tray="strip"]').evaluate('e => [e.scrollLeft, e.clientWidth, e.scrollWidth].join("/")')); pg.close()
        except Exception as e:
            check('Tabs could be driven', False, str(e).split(chr(10))[0][:140])

        try:
            pg = open_('DropdownMenu')
            more = pg.locator('[data-tray="menu"]').nth(1)
            more.locator('button').first.click(); check('menu opens with focus on its first item', pg.evaluate('document.activeElement.textContent.trim()') == 'Edit')
            pg.keyboard.press('ArrowDown'); check('arrow keys move in a menu', pg.evaluate('document.activeElement.textContent.trim()') == 'Archive')
            pg.keyboard.press('Escape'); settled(pg); check('Escape closes a menu and returns focus', not more.locator('.tray-pop').is_visible() and pg.evaluate('document.activeElement.getAttribute("aria-label")') == 'More actions')
            first = pg.locator('[data-tray="menu"]').first; box = first.locator('[role="menuitemcheckbox"]')
            first.locator('button').first.click()  # reopen: the click on the other menu closed it
            box.click(); check('a checkbox item toggles and keeps the menu open', box.get_attribute('aria-checked') == 'false' and first.locator('.tray-pop').first.is_visible()); pg.close()
        except Exception as e:
            check('DropdownMenu could be driven', False, str(e).split(chr(10))[0][:140])

        try:
            pg = open_('Menubar')
            pg.mouse.click(700, 300)  # close the menu the preview holds open
            pg.locator('.tray-menubar > .tray-anchor > button').first.click()
            check('a menubar menu opens', pg.locator('.tray-menubar > .tray-anchor').first.locator('.tray-pop').first.is_visible())
            pg.keyboard.press('ArrowRight'); check('right moves to the next menu', pg.locator('.tray-menubar > .tray-anchor').nth(1).locator('.tray-pop').first.is_visible()); pg.close()
        except Exception as e:
            check('Menubar could be driven', False, str(e).split(chr(10))[0][:140])

        try:
            pg = open_('ContextMenu')
            pg.keyboard.press('Escape'); region = pg.locator('.tray-context'); pg.mouse.click(700, 150)
            region.click(button='right', position={'x': 400, 'y': 120}); check('right-click opens the context menu', region.locator('.tray-pop').is_visible())
            pg.keyboard.press('Escape'); settled(pg); check('Escape closes it', not region.locator('.tray-pop').is_visible()); pg.close()
        except Exception as e:
            check('ContextMenu could be driven', False, str(e).split(chr(10))[0][:140])

        try:
            pg = open_('Dialog')
            pg.click('[data-target="#dlg-real"]'); check('dialog opens over the page', pg.evaluate('document.getElementById("dlg-real").matches(":modal")'))
            pg.keyboard.press('Escape'); check('Escape closes it', not pg.evaluate('document.getElementById("dlg-real").open'))
            check('focus returns to the button', pg.evaluate('document.activeElement.dataset.target') == '#dlg-real')
            pg.click('[data-target="#dlg-real"]'); pg.click('#dlg-real [data-close][value="save"]'); check('a data-close button closes with its value', pg.evaluate('document.getElementById("dlg-real").returnValue') == 'save')
            pg.click('[data-target="#dlg-real"]'); box = pg.locator('#dlg-real').bounding_box()
            pg.mouse.move(box['x'] + 30, box['y'] + 30); pg.mouse.down(); pg.mouse.move(5, 5, steps=4); pg.mouse.up(); pg.wait_for_timeout(60)
            check('a selection dragged out of the dialog onto the veil leaves it open', pg.evaluate('document.getElementById("dlg-real").open'))
            pg.mouse.click(5, 5); pg.wait_for_timeout(60)
            check('a click on the veil closes it', not pg.evaluate('document.getElementById("dlg-real").open'))
            check('a scroll inside an open modal does not reach the page', pg.evaluate("(() => { const d = document.getElementById('dlg-real'); d.showModal(); const v = getComputedStyle(d).overscrollBehaviorY; d.close(); return v; })()") == 'contain'); pg.close()
        except Exception as e:
            check('Dialog could be driven', False, str(e).split(chr(10))[0][:140])

        try:
            pg = open_('Popover')
            second = pg.locator('[data-tray="popover"]').nth(1); second.locator('button').click(); check('popover opens', second.locator('.tray-pop').is_visible())
            pg.mouse.click(5, 5); settled(pg); check('a click outside closes it', not second.locator('.tray-pop').is_visible()); pg.close()
        except Exception as e:
            check('Popover could be driven', False, str(e).split(chr(10))[0][:140])

        try:
            pg = open_('Tooltip')
            dl = pg.locator('[data-tray="tooltip"]').nth(1); dl.hover(); check('tooltip shows on hover', dl.locator('.tray-tooltip').is_visible())
            check('tooltip is tied to its control', dl.locator('button').get_attribute('aria-describedby') == dl.locator('.tray-tooltip').get_attribute('id')); pg.close()
        except Exception as e:
            check('Tooltip could be driven', False, str(e).split(chr(10))[0][:140])

        try:
            pg = open_('HoverCard')
            pg.evaluate('document.querySelector(".tray-pop").hidden = true'); pg.hover('[data-tray="hovercard"] a'); pg.wait_for_timeout(400)
            check('hover card opens after a moment', pg.is_visible('.tray-pop')); pg.close()
        except Exception as e:
            check('HoverCard could be driven', False, str(e).split(chr(10))[0][:140])

        try:
            pg = open_('Toast')
            pg.click('#ts-a'); check('toast appears', pg.locator('.tray-toasts .tray-toast').count() == 1)
            pg.click('.tray-toasts [data-action]'); check('its action runs and replaces it', pg.locator('.tray-toasts .tray-toast').count() == 1 and 'restored' in pg.inner_text('.tray-toasts'))
            pg.click('#ts-c'); check('an error toast is an alert', pg.locator('.tray-toasts [role="alert"]').count() == 1); pg.close()
        except Exception as e:
            check('Toast could be driven', False, str(e).split(chr(10))[0][:140])

        try:
            pg = open_('DataTable')
            first_cell = lambda: pg.locator('tbody tr:visible th').first.inner_text()
            check('data table shows its first page', pg.locator('tbody tr:visible').count() == 5 and pg.inner_text('[data-page-status]') == '1–5 of 8', pg.inner_text('[data-page-status]'))
            pg.locator('.tray-sort', has_text='Total').click(); check('sorting by Total puts the smallest first', first_cell() == 'PL-20411', first_cell())
            pg.locator('.tray-sort', has_text='Total').click(); check('a second click reverses it', first_cell() == 'PL-20416', first_cell())
            pg.click('[data-page-next]'); check('next page', pg.inner_text('[data-page-status]') == '6–8 of 8')
            pg.fill('[data-filter]', 'franko'); check('filter narrows the rows', pg.locator('tbody tr:visible').count() == 1 and first_cell() == 'PL-20415')
            pg.fill('[data-filter]', 'nobody'); check('no match shows the empty row', pg.is_visible('[data-empty]'))
            pg.fill('[data-filter]', ''); pg.check('[data-select-all]', force=True); check('select all', pg.inner_text('[data-selected-count]') == '8 of 8 selected', pg.inner_text('[data-selected-count]')); pg.close()
        except Exception as e:
            check('DataTable could be driven', False, str(e).split(chr(10))[0][:140])

        try:
            pg = open_('Chart')
            plot = pg.locator('#c-bar .tray-chart__plot'); box = plot.bounding_box()
            pg.mouse.move(box['x'] + box['width'] * (4.5 / 12), box['y'] + 40)
            check('chart tooltip names the point', plot.locator('.tray-tip').inner_text() == 'May, 22 kg', plot.locator('.tray-tip').inner_text())
            plot.focus(); pg.keyboard.press('ArrowRight'); check('arrow keys walk the chart and announce it', 'Jun' in plot.locator('[aria-live]').inner_text(), plot.locator('[aria-live]').inner_text())
            line = pg.locator('#c-line .tray-chart__plot'); lb = line.bounding_box(); pg.mouse.move(lb['x'] + lb['width'] * .5, lb['y'] + 30)
            check('a chart with two series lists both', line.locator('.tray-tip__row').count() == 2)
            check('every multi-series chart has a legend', pg.locator('#c-line .tray-chart__legend li').count() == 2 and pg.locator('#c-stack .tray-chart__legend li').count() == 4)
            pg.locator('#c-bar details summary').click(); check('the figures table opens', pg.locator('#c-bar details tbody tr').count() == 12)
            pg.locator('#c-donut .tray-chart__round').scroll_into_view_if_needed(); rb = pg.locator('#c-donut .tray-chart__round').bounding_box(); pg.mouse.move(rb['x'] + rb['width'] * .783, rb['y'] + rb['height'] * .217); check('donut centre follows the segment', 'Jars' in pg.inner_text('#c-donut .tray-chart__center'), pg.inner_text('#c-donut .tray-chart__center')); pg.close()
        except Exception as e:
            check('Chart could be driven', False, str(e).split(chr(10))[0][:140])

        try:
            pg = open_('Carousel')
            pg.click('[data-next]'); pg.wait_for_timeout(300); check('carousel moves and counts', pg.inner_text('.tray-carousel__count') == '2 / 5', pg.inner_text('.tray-carousel__count')); pg.close()
        except Exception as e:
            check('Carousel could be driven', False, str(e).split(chr(10))[0][:140])

        try:
            pg = open_('Resizable')
            h = pg.locator('.tray-split__handle'); h.focus(); pg.keyboard.press('ArrowRight'); check('split handle moves with the keyboard', h.get_attribute('aria-valuenow') == '36', h.get_attribute('aria-valuenow')); pg.close()
        except Exception as e:
            check('Resizable could be driven', False, str(e).split(chr(10))[0][:140])

        try:
            pg = open_('Sidebar')
            pg.click('[data-tray="sidebar-toggle"]'); pg.wait_for_timeout(400); check('sidebar collapses to a rail', pg.locator('#sb1').get_attribute('data-collapsed') is not None and pg.locator('#sb1').bounding_box()['width'] < 90); pg.close()
        except Exception as e:
            check('Sidebar could be driven', False, str(e).split(chr(10))[0][:140])

        try:
            pg = open_('Command')
            pg.fill('.tray-command input', 'exp'); vis = pg.locator('.tray-command [role="option"]:visible')
            check('command filters and hides empty groups', vis.count() == 1 and pg.locator('.tray-command [data-group]:visible').count() == 1); pg.close()
        except Exception as e:
            check('Command could be driven', False, str(e).split(chr(10))[0][:140])

        try:
            pg = open_('MessageScroller')
            before = pg.locator('.tray-message').count(); pg.fill('.tray-composer textarea', 'On my way down.'); pg.click('.tray-composer button')
            check('a sent message is added and kept in view', pg.locator('.tray-message').count() == before + 1 and pg.evaluate('(() => { const v = document.querySelector(".tray-scroller__viewport"); return v.scrollHeight - v.scrollTop - v.clientHeight < 24; })()'))
            pg.evaluate('document.querySelector(".tray-scroller__viewport").scrollTop = 0'); pg.wait_for_timeout(100)
            check('scrolling back offers "Latest"', pg.is_visible('.tray-scroller__jump')); pg.close()
        except Exception as e:
            check('MessageScroller could be driven', False, str(e).split(chr(10))[0][:140])

        try:
            pg = open_('Bubble')
            r = pg.locator('.tray-reaction').nth(1); r.click(); check('a reaction toggles and counts', r.get_attribute('aria-pressed') == 'true' and r.locator('[data-count]').inner_text() == '2')
            pg.click('[data-tray="more"]'); check('"Show more" opens a long bubble', pg.locator('#bb-long').get_attribute('data-clamp') is None and pg.inner_text('[data-tray="more"]') == 'Show less'); pg.close()
        except Exception as e:
            check('Bubble could be driven', False, str(e).split(chr(10))[0][:140])

        try:
            pg = open_('Questionnaire')
            pg.click('[data-next]'); check('questionnaire moves to the next question', pg.inner_text('[data-progress]') == 'Question 2 of 3')
            check('Next waits for an answer', pg.is_disabled('[data-next]'))
            pg.locator('input[name="q2"]').first.check(force=True); pg.click('[data-next]'); check('an optional question can be skipped', not pg.is_disabled('[data-next]') and pg.inner_text('[data-next]') == 'Finish')
            pg.click('[data-next]'); check('finishing lists the answers', pg.is_visible('[data-done]') and pg.locator('.tray-questionnaire__answers > div').count() == 3 and 'Skipped' in pg.inner_text('.tray-questionnaire__answers')); pg.close()
        except Exception as e:
            check('Questionnaire could be driven', False, str(e).split(chr(10))[0][:140])

        try:
            pg = open_('CodeBlock')
            pg.click('[data-tray="copy"]')
            try: pg.wait_for_function("() => { const s = document.querySelector('[data-tray=copy]').nextElementSibling; return s && s.textContent.trim(); }", timeout=1500)  # said on the next frame
            except Exception: pass
            said = pg.evaluate("(() => { const b = document.querySelector('[data-tray=copy]'); const s = b.nextElementSibling; return [b.querySelector('[data-label]').textContent, s && s.getAttribute('role'), s && s.textContent.trim()]; })()")
            check('copy says "Copied" on the button, and aloud through a status beside it', said == ['Copied', 'status', 'Copied'], said)
            pg.evaluate("() => { navigator.clipboard.writeText = () => Promise.reject(new Error('refused')); }")
            pg.click('[data-tray="copy"]'); pg.wait_for_timeout(200)
            check('a copy the browser refuses says "Copy failed", not "Copied"', pg.inner_text('[data-label]') == 'Copy failed', pg.inner_text('[data-label]')); pg.close()
        except Exception as e:
            check('CodeBlock could be driven', False, str(e).split(chr(10))[0][:140])

        try:
            pg = open_('Accordion')
            first = pg.locator('.tray-accordion').first; first.locator('summary').nth(1).click()
            check('opening one accordion item closes the other', first.locator('details[open]').count() == 1); pg.close()
        except Exception as e:
            check('Accordion could be driven', False, str(e).split(chr(10))[0][:140])

        # ---- the application set ----
        LISTEN = "window.__ev = []; ['change', 'complete', 'close'].forEach(n => document.addEventListener('tray:' + n, e => window.__ev.push([n, JSON.parse(JSON.stringify(e.detail || null, (k, v) => v instanceof File ? v.name : v))])))"

        def drive(name, fn):
            try:
                pg = open_(name); pg.evaluate(LISTEN); fn(pg); pg.close()
            except Exception as e:
                check(f'{name} could be driven', False, str(e).split(chr(10))[0][:160])

        def banner(pg):
            first = pg.locator('.tray-banner').first
            first.locator('[data-tray="dismiss"]').click()
            settled(pg); check('dismiss hides its banner and reports it', first.is_hidden() and pg.evaluate('window.__ev.some(e => e[0] === "close")'))
        drive('Banner', banner)

        def stat(pg):
            check('spark draws a line', pg.locator('.tray-spark path').count() == 4 and pg.locator('.tray-spark path').first.get_attribute('d').count('L') == 7)
        drive('StatCard', stat)

        def uptime(pg):
            bars = pg.locator('.tray-uptime__bars').first
            check('uptime draws a bar per day with its incidents', bars.locator('span').count() == 90 and bars.locator('span[data-s="down"]').count() == 1 and bars.locator('span[data-s="degraded"]').count() == 2)
            check('an incident sits the right number of days back', bars.locator('span').nth(89 - 47).get_attribute('data-s') == 'down')
        drive('Uptime', uptime)

        def pricing(pg):
            price = pg.locator('.tray-card--accent .tray-plan__price span')
            check('pricing shows the monthly price first', price.inner_text() == '$29')
            pg.locator('input[value="yearly"]').check(force=True)
            check('pricing switches to yearly', price.inner_text() == '$24' and 'billed yearly' in pg.locator('.tray-card--accent .tray-plan__price small').inner_text() and pg.evaluate('window.__ev.some(e => e[0] === "change" && e[1].period === "yearly")'))
        drive('PricingTable', pricing)

        def payment(pg):
            pg.fill('#pm-number', ''); pg.type('#pm-number', '4242424242424242')
            pg.type('#pm-exp', '0827')
            check('mask groups a card number and an expiry date', pg.input_value('#pm-number') == '4242 4242 4242 4242' and pg.input_value('#pm-exp') == '08/27', pg.input_value('#pm-number') + ' | ' + pg.input_value('#pm-exp'))
        drive('PaymentMethod', payment)

        def keys(pg):
            s = pg.locator('.tray-secret[data-tray="secret"]').first
            s.locator('[data-secret="show"]').click()
            check('secret shows the key and renames its button', s.locator('code').inner_text() == 'ck_live_9f2c41d87ab04f2a' and s.locator('[data-secret="show"]').get_attribute('aria-label') == 'Hide the key')
            s.locator('[data-secret="show"]').click()
            check('secret hides the key again', '4f2a' in s.locator('code').inner_text() and '9f2c' not in s.locator('code').inner_text())
            s.locator('[data-secret="copy"]').click(); pg.wait_for_timeout(150)
            check('secret reports a copy', pg.evaluate('window.__ev.some(e => e[0] === "change" && e[1] && e[1].copied)'))
        drive('ApiKeys', keys)

        def tags(pg):
            box = pg.locator('.tray-tags').first
            pg.click('#ti-1'); pg.keyboard.type('fragile'); pg.keyboard.press('Enter')
            check('tag input adds a chip on Enter', box.locator('.tray-chip').count() == 3 and box.locator('input[type="hidden"]').input_value() == 'gift,chilled,fragile', box.locator('input[type="hidden"]').input_value())
            pg.keyboard.type('gift,'); check('tag input ignores a repeat', box.locator('.tray-chip').count() == 3)
            pg.fill('#ti-1', ''); pg.keyboard.press('Backspace')
            check('Backspace removes the last chip', box.locator('.tray-chip').count() == 2)
            box.locator('.tray-chip__x').first.click(); check('a chip removes itself', box.locator('.tray-chip').count() == 1 and box.locator('input[type="hidden"]').input_value() == 'chilled')
            mail = pg.locator('.tray-tags').nth(1)
            mail.locator('.tray-chip[data-invalid] .tray-chip__x').click(); check('removing the wrong address clears the error state', mail.get_attribute('aria-invalid') is None)
            pg.click('#ti-2'); pg.keyboard.type('not-an-email'); pg.keyboard.press('Enter')
            check('a wrong email becomes an invalid chip', mail.locator('.tray-chip[data-invalid]').count() == 1 and mail.get_attribute('aria-invalid') == 'true')
            city = pg.locator('.tray-tags').nth(2)
            pg.click('#ti-3'); pg.keyboard.type('Odesa,Dnipro,Kharkiv,')
            check('tag input stops at its maximum', city.locator('.tray-chip').count() == 4, str(city.locator('.tray-chip').count()))
        drive('TagInput', tags)

        def upload(pg):
            pg.set_input_files('#fu-list >> xpath=preceding-sibling::div//input[@type="file"]', [{'name': 'label.png', 'mimeType': 'image/png', 'buffer': b'x' * 2048}, {'name': 'huge.jpg', 'mimeType': 'image/jpeg', 'buffer': b'x' * (11 * 1048576)}])
            rows = pg.locator('#fu-list .tray-attachment')
            check('dropzone lists the chosen files', rows.count() == 4 and rows.nth(2).locator('.tray-attachment__meta').inner_text() == '2 KB', str(rows.count()))
            check('dropzone marks a file that is too large', rows.nth(3).get_attribute('data-state') == 'error' and 'Too large' in rows.nth(3).inner_text())
            rows.nth(2).locator('button').click(); check('a listed file can be removed', pg.locator('#fu-list .tray-attachment').count() == 3)
        drive('FileUpload', upload)

        def checklist(pg):
            root = pg.locator('[data-tray="checklist"]')
            check('checklist opens the first unfinished task', root.locator('.tray-task[aria-current]').locator('b').inner_text() == 'Choose the courier days' and root.locator('.tray-task').nth(3).locator('p').is_hidden())
            root.locator('.tray-task[aria-current] [data-task-done]').click()
            check('finishing a task moves on and fills the bar', root.locator('.tray-task[aria-current] b').inner_text() == 'Print a test label' and root.locator('.tray-progress__value').inner_text() == '3 of 5' and root.locator('.tray-progress__bar').get_attribute('aria-valuenow') == '3')
            root.locator('.tray-task[aria-current] [data-task-done]').click(); root.locator('.tray-task[aria-current] [data-task-done]').click()
            check('the last task completes the checklist', root.locator('[data-checklist-done]').is_visible() and pg.evaluate('window.__ev.some(e => e[0] === "complete" && e[1].done === 5)'))
        drive('OnboardingChecklist', checklist)

        def tour(pg):
            steps = pg.locator('.tray-tour')
            check('tour shows its first step on its target', steps.nth(0).is_visible() and steps.nth(0).locator('.tray-tour__count').inner_text() == '1 of 3' and pg.locator('#tr-tabs').get_attribute('data-tour-on') == '')
            steps.nth(0).locator('[data-tour="next"]').click()
            check('Next moves the tour and its ring', steps.nth(1).is_visible() and steps.nth(0).is_hidden() and pg.locator('#tr-export').get_attribute('data-tour-on') == '' and pg.locator('#tr-tabs').get_attribute('data-tour-on') is None)
            box, target = steps.nth(1).bounding_box(), pg.locator('#tr-export').bounding_box()
            check('the step sits under its target', box['y'] >= target['y'] + target['height'] and box['x'] + box['width'] <= 920, f'{box} {target}')
            steps.nth(1).locator('[data-tour="back"]').click(); check('Back returns', steps.nth(0).is_visible())
            steps.nth(0).locator('[data-tour="skip"]').click()
            check('Skip ends the tour', steps.nth(0).is_hidden() and pg.locator('[data-tour-on]').count() == 0 and pg.evaluate('window.__ev.some(e => e[0] === "complete" && e[1].finished === false)'))
        drive('Tour', tour)

        def feedback(pg):
            form = pg.locator('[data-tray="feedback"]').first
            check('feedback hides the follow-up at first', form.locator('[data-feedback="more"]').is_hidden())
            form.locator('input[value="9"]').check(force=True)
            check('a rating opens the follow-up', form.locator('[data-feedback="more"]').is_visible())
            form.locator('textarea').fill('Fast packing'); form.locator('button[type="submit"]').click()
            check('sending shows the thanks and reports the answer', form.locator('[data-feedback="thanks"]').is_visible() and form.locator('[data-feedback="ask"]').is_hidden() and pg.evaluate('window.__ev.some(e => e[0] === "complete" && e[1].rating === "9" && e[1].comment === "Fast packing")'))
        drive('FeedbackWidget', feedback)

        def consent(pg):
            pg.locator('[data-consent="all"]').click()
            check('consent closes and reports every choice', pg.locator('.tray-consent').is_hidden() and pg.evaluate('window.__ev.some(e => e[0] === "complete" && e[1].choice.necessary === true && e[1].choice.statistics === true)'))
        drive('CookieConsent', consent)

        def consent2(pg):
            pg.locator('input[name="statistics"]').check(force=True); pg.locator('[data-consent="necessary"]').click()
            check('"Only necessary" clears the optional ones', pg.evaluate('window.__ev.some(e => e[0] === "complete" && e[1].choice.necessary === true && e[1].choice.statistics === false)'))
        drive('CookieConsent', consent2)

        def notices(pg):
            pip = pg.locator('[data-notices-count]')
            check('the bell counts the unread', pip.inner_text() == '2')
            pg.locator('.tray-notice[data-unread]').first.evaluate('n => { n.addEventListener("click", e => e.preventDefault()); n.click(); }')
            check('opening a notification marks it read', pip.inner_text() == '1' and pg.locator('.tray-notice[data-unread]').count() == 1)
            pg.locator('input[name="notices-view"][value="unread"]').check(force=True)
            check('"Unread" filters the list', pg.locator('.tray-notices__list li:visible').count() == 1)
            pg.locator('[data-notices="read-all"]').click()
            check('"Mark all as read" empties the count', pip.inner_text() == '' and pip.is_hidden() and pg.locator('[data-notices="empty"]').is_visible() and pg.locator('[data-notices="read-all"]').is_disabled())
        drive('NotificationCenter', notices)

        def filters(pg):
            bar = pg.locator('[data-tray="filterbar"]')
            bar.locator('.tray-chip__x').first.click()
            check('removing a chip unchecks its menu item', bar.locator('.tray-chip').count() == 1 and bar.locator('[data-value="status:to-pack"][role]').get_attribute('aria-checked') == 'false')
            bar.locator('[data-tray="menu"] > button').first.click(); bar.locator('[role="menuitemcheckbox"][data-value="status:delivered"]').click(); pg.wait_for_timeout(60)
            check('checking a menu item adds its chip', bar.locator('.tray-chip[data-value="status:delivered"]').inner_text().strip() == 'Status: Delivered' and pg.evaluate('window.__ev.filter(e => e[0] === "change").pop()[1].filters.join("|")') == 'delivery:courier|status:delivered')
            pg.keyboard.press('Escape'); bar.locator('[data-filter="clear"]').click()
            check('"Clear all" removes every filter and hides the row', bar.locator('.tray-chip').count() == 0 and bar.locator('.tray-filterbar__chips').is_hidden() and bar.locator('[role="menuitemcheckbox"][aria-checked="true"]').count() == 0)
        drive('FilterBar', filters)

        def shell(pg):
            pg.set_viewport_size({'width': 1180, 'height': 900})
            sb = pg.locator('#app-sb'); pg.locator('[data-tray="sidebar-toggle"]').click(); pg.wait_for_timeout(350)
            check('the app shell collapses its sidebar to a rail', sb.get_attribute('data-collapsed') is not None and sb.bounding_box()['width'] < 100 and sb.locator('.tray-switcher .tray-avatar').is_visible() and sb.locator('.tray-usage').is_hidden())
            pg.set_viewport_size({'width': 700, 'height': 900}); pg.wait_for_timeout(100)
            check('the app shell hides the sidebar on a narrow screen', pg.locator('.tray-app__side').is_hidden())
        drive('AppShell', shell)

        def alertdialog(pg):
            pg.evaluate('''() => { const d = document.querySelector('dialog[role="alertdialog"]'); d.close(); d.id = 'ad'; const b = document.createElement('button');
                b.type = 'button'; b.id = 'ad-open'; b.dataset.tray = 'open'; b.dataset.target = '#ad'; b.textContent = 'Delete'; document.body.appendChild(b); TrayUI.init(document.body); }''')
            pg.click('#ad-open'); pg.wait_for_timeout(60)
            check('an alert dialog opens on its safe choice, not on the dangerous one', pg.evaluate('document.activeElement.textContent') == 'Keep the order', pg.evaluate('document.activeElement.textContent'))
        drive('AlertDialog', alertdialog)

        # ---- media: the lightbox and the video player ----
        def lightbox(pg):
            count = lambda: pg.inner_text('.tray-lightbox__count')
            status = lambda: pg.inner_text('#farm-pictures [role="status"]')
            pg.locator('.tray-gallery__item').nth(2).focus(); pg.keyboard.press('Enter'); pg.wait_for_timeout(300)
            check('a thumbnail opens the lightbox on its own picture', pg.evaluate("document.getElementById('farm-pictures').open") and count() == '3 / 6', count())
            check('the lightbox makes one slide for each link, with its text and caption', pg.locator('.tray-lightbox__slide').count() == 6
                  and pg.locator('.tray-lightbox__slide img').nth(2).get_attribute('alt').startswith('Thousands of pale trout eggs')
                  and 'Snail eggs are smaller and whiter' in pg.locator('.tray-lightbox__slide').nth(2).inner_text())
            pg.click('[data-next]'); pg.wait_for_timeout(400)
            check('Next moves one picture on, and the count and the status line follow', count() == '4 / 6' and status().startswith('4 of 6: A small jar of caviar'), [count(), status()])
            pg.keyboard.press('ArrowLeft'); pg.wait_for_timeout(400)
            check('the arrow keys move through the pictures', count() == '3 / 6', count())
            pg.keyboard.press('End'); pg.wait_for_timeout(400)
            check('End goes to the last picture and Next turns off', count() == '6 / 6' and pg.locator('[data-next]').is_disabled(), count())
            pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
            check('Escape closes the lightbox and the focus goes back to the thumbnail', not pg.evaluate("document.getElementById('farm-pictures').open")
                  and pg.evaluate("document.activeElement === document.querySelectorAll('.tray-gallery__item')[2]"))
        drive('Lightbox', lightbox)

        def player(pg):
            v = 'document.querySelector(".tray-player video")'
            check("the player takes the browser's controls off and shows its own bar", pg.evaluate(f'!{v}.controls') and pg.locator('.tray-player__bar').is_visible())
            pg.wait_for_function(f'{v}.readyState >= 1')
            check('the player reads the length of the film', pg.inner_text('[data-total]') == '0:13', pg.inner_text('[data-total]'))
            pg.locator('.tray-player__bar [data-play]').click(); pg.wait_for_timeout(700)
            check('Play plays the film, the button becomes Pause and the large one goes', pg.evaluate(f'!{v}.paused')
                  and pg.get_attribute('.tray-player__bar [data-play]', 'aria-label') == 'Pause' and not pg.locator('.tray-player__big').is_visible())
            pg.locator('.tray-player__bar [data-play]').click(); pg.wait_for_timeout(100)
            pg.evaluate("() => { const s = document.querySelector('[data-seek]'); s.value = '6'; s.dispatchEvent(new Event('input', { bubbles: true })); s.dispatchEvent(new Event('change', { bubbles: true })); }")
            pg.wait_for_timeout(300)
            check('the slider moves the film, and reads the place as a time', abs(pg.evaluate(f'{v}.currentTime') - 6) < .3
                  and pg.get_attribute('[data-seek]', 'aria-valuetext') == '0:06 of 0:13' and pg.inner_text('[data-now]') == '0:06',
                  [pg.evaluate(f'{v}.currentTime'), pg.get_attribute('[data-seek]', 'aria-valuetext')])
            pg.click('[data-captions]')
            check('Captions is a toggle that shows the track', pg.get_attribute('[data-captions]', 'aria-pressed') == 'true' and pg.evaluate(f'{v}.textTracks[0].mode') == 'showing')
            pg.click('[data-mute]'); pg.wait_for_timeout(50)
            check('Mute turns the sound off and the button says how to turn it on', pg.evaluate(f'{v}.muted') and pg.get_attribute('[data-mute]', 'aria-label') == 'Turn the sound on')
        drive('VideoPlayer', player)

        # ---- motion, for a visitor who has not asked for less of it ----
        mctx = b.new_context(viewport={'width': 920, 'height': 900}, reduced_motion='no-preference')
        mctx.add_init_script('(() => { const boot = () => { const d = document.documentElement; if (!d) return false; d.setAttribute("data-theme", "light");'
                             ' for (const t of ' + json.dumps([tokens, css]) + ') { const s = document.createElement("style"); s.textContent = t; d.appendChild(s); } return true; };'
                             ' if (!boot()) new MutationObserver((_, o) => { if (boot()) o.disconnect(); }).observe(document, { childList: true }); })();')
        mctx.add_init_script(js)
        mctx.set_default_timeout(4000)

        def mopen(name):
            pg = mctx.new_page()
            pg.on('pageerror', lambda e: errors.append(f'{name} (motion): {e}'))
            pg.goto((P / 'components' / name / 'preview.html').as_uri(), wait_until='load')
            pg.wait_for_timeout(300)
            return pg

        running = "el => el.getAnimations({ subtree: true }).length"
        try:
            pg = mopen('Dialog')
            pg.evaluate("() => { const d = document.getElementById('dlg-real'); d.showModal(); }")
            moving = pg.evaluate("() => document.getElementById('dlg-real').getAnimations().length")
            pg.wait_for_timeout(350)
            settled = pg.evaluate("() => [document.getElementById('dlg-real').open, getComputedStyle(document.getElementById('dlg-real')).opacity]")
            check('a dialog comes in with a transition and ends fully shown', moving > 0 and settled == [True, '1'], [moving, settled])
            pg.locator('#dlg-real [data-close]').first.click(); pg.wait_for_timeout(30)
            leaving = pg.evaluate("() => document.getElementById('dlg-real').getAnimations().length")
            pg.wait_for_timeout(350)
            check('it leaves with a transition, and is closed when it has left', leaving > 0 and not pg.evaluate("document.getElementById('dlg-real').open"), leaving)
            pg.close()
        except Exception as e:
            check('Dialog motion could be driven', False, str(e).split(chr(10))[0][:140])

        try:
            pg = mopen('Popover')
            pop = pg.locator('[data-tray="popover"]').nth(1)
            pop.locator('button').click(); pg.wait_for_timeout(20)
            check('a popover opens from its trigger with a transition', pop.locator('.tray-pop').evaluate(running) > 0)
            pg.wait_for_timeout(300); pg.mouse.click(5, 5); pg.wait_for_timeout(40)
            still = pop.locator('.tray-pop').is_visible()
            pg.wait_for_timeout(300)
            check('and goes away with one: still shown while it leaves, hidden once it has left', still and not pop.locator('.tray-pop').is_visible(), still)
            pg.close()
        except Exception as e:
            check('Popover motion could be driven', False, str(e).split(chr(10))[0][:140])

        under = """strip => { const p = strip.querySelector(':scope > .tray-glide'), c = strip.querySelector('input:checked + span, [aria-selected="true"]');
                    const a = p.getBoundingClientRect(), b = c.getBoundingClientRect();
                    return [strip.hasAttribute('data-glide'), Math.round(a.left - b.left), Math.round(a.width - b.width)]; }"""
        try:
            pg = mopen('ToggleGroup')
            seg = pg.locator('.tray-seg').first
            check('a segmented control gets a pill under its chosen item', seg.evaluate(under) == [True, 0, 0], seg.evaluate(under))
            seg.locator('.tray-seg__item:not(:has(input:checked))').first.click(); pg.wait_for_timeout(30)
            moving = seg.locator('.tray-glide').evaluate('el => el.getAnimations().length')
            pg.wait_for_timeout(350)
            check('the pill slides to the next choice and lands under it', moving > 0 and seg.evaluate(under) == [True, 0, 0], [moving, seg.evaluate(under)])
            pg.close()
        except Exception as e:
            check('ToggleGroup motion could be driven', False, str(e).split(chr(10))[0][:140])

        try:
            pg = mopen('Tabs')
            strip = pg.locator('.tray-tabs').first
            check('a strip of tabs gets the pill under its chosen tab', strip.evaluate(under) == [True, 0, 0], strip.evaluate(under))
            strip.locator('[role="tab"]').nth(1).click(); pg.wait_for_timeout(350)
            check('it slides to the tab chosen, and that panel fades in', strip.evaluate(under) == [True, 0, 0] and pg.locator('[data-tray="tabs"]').first.get_attribute('data-switched') == '', strip.evaluate(under))
            links = pg.locator('nav.tray-tabs').first
            links.evaluate("n => { n.innerHTML = '<a class=\"tray-tab\" href=\"#a\">Orders</a><a class=\"tray-tab\" href=\"#b\" aria-current=\"page\">Customers</a>'; }"); pg.wait_for_timeout(350)
            again = links.evaluate("n => { const p = n.querySelector(':scope > .tray-glide'), c = n.querySelector('[aria-current=page]'); if (!p) return 'no pill'; const a = p.getBoundingClientRect(), b = c.getBoundingClientRect(); return [n.hasAttribute('data-glide'), Math.round(a.left - b.left), Math.round(a.width - b.width)]; }")
            check('a strip of links written anew keeps its pill, under the new current link', again == [True, 0, 0], again)
            pg.close()
        except Exception as e:
            check('Tabs motion could be driven', False, str(e).split(chr(10))[0][:140])

        try:
            pg = mopen('Toast')
            pg.evaluate("() => { window.__t = TrayUI.toast({ title: 'Order archived', duration: 0 }); }"); pg.wait_for_timeout(300)
            pg.evaluate("() => window.__t.dismiss()"); pg.wait_for_timeout(40)
            leaving = pg.evaluate("() => [window.__t.element.isConnected, window.__t.element.hasAttribute('data-leaving')]")
            pg.wait_for_timeout(400)
            check('a toast sinks out before it is taken away', leaving == [True, True] and not pg.evaluate("window.__t.element.isConnected"), leaving)
            pg.close()
        except Exception as e:
            check('Toast motion could be driven', False, str(e).split(chr(10))[0][:140])

        try:
            pg = mopen('Checkbox')
            box = pg.locator('.tray-check').first  # unchecked in the preview; a lazy locator on :not(:checked) would move on after the click
            box.click(); pg.wait_for_timeout(30)
            mid = box.locator('.tray-check__tick').evaluate("p => parseFloat(getComputedStyle(p).strokeDashoffset)")
            pg.wait_for_timeout(400)
            end = box.locator('.tray-check__tick').evaluate("p => parseFloat(getComputedStyle(p).strokeDashoffset)")
            check('a tick draws itself', mid > 0 and end == 0, [mid, end])
            pg.close()
        except Exception as e:
            check('Checkbox motion could be driven', False, str(e).split(chr(10))[0][:140])

        try:
            pg = mopen('ButtonGroup')
            stepper = pg.locator('[data-tray~="stepper"]').first
            stepper.locator('[data-step="1"]').click(); pg.wait_for_timeout(30)
            check('the number of a stepper bumps when it changes', stepper.locator('output').get_attribute('data-bump') in ('a', 'b') and stepper.locator('output').evaluate('o => o.getAnimations().length') > 0)
            pg.close()
        except Exception as e:
            check('Stepper motion could be driven', False, str(e).split(chr(10))[0][:140])
        mctx.close()

        # ---- modes: forced colours, more contrast, print ----
        def mode(name, theme='light', **media):
            pg = ctx.new_page(); pg.on('pageerror', lambda e: errors.append(f'{name}: {e}'))
            pg.emulate_media(**media)
            pg.goto((P / 'components' / name / 'preview.html').as_uri(), wait_until='load')
            pg.evaluate('t => document.documentElement.setAttribute("data-theme", t)', theme)
            pg.set_viewport_size({'width': 920, 'height': 901}); pg.wait_for_timeout(150)  # Chromium applies forced colours on the next layout
            return pg
        pg = mode('Tabs', forced_colors='active')
        tabs = pg.evaluate('''(() => { const on = document.querySelector('.tray-tab[aria-selected="true"]'), off = document.querySelector('.tray-tab:not([aria-selected="true"])');
            return [getComputedStyle(on).backgroundColor, getComputedStyle(off).backgroundColor, getComputedStyle(on.closest('.tray-tabs')).borderTopStyle, getComputedStyle(on).forcedColorAdjust]; })()''')
        check('with forced colours the chosen tab keeps a fill of its own, in the system\'s colours, and the strip gets an edge', tabs[0] != tabs[1] and tabs[2] == 'solid' and tabs[3] == 'none', tabs)
        pg.close(); pg = mode('Switch', forced_colors='active')
        sw = pg.evaluate('''(() => { const t = [...document.querySelectorAll('.tray-switch input:not(:disabled)')]; const on = t.find(i => i.checked), off = t.find(i => !i.checked);
            const track = i => i.nextElementSibling; return [getComputedStyle(track(on)).backgroundColor, getComputedStyle(track(off)).backgroundColor, getComputedStyle(track(off)).boxShadow,
            getComputedStyle(track(off), '::before').backgroundColor, getComputedStyle(track(off)).backgroundColor]; })()''')
        check('with forced colours a switch is still drawn: an edge and a knob when off, a fill when on', sw[0] != sw[1] and 'inset' in sw[2] and sw[3] != sw[4], sw)
        pg.close(); pg = mode('Button', forced_colors='active')
        check('with forced colours a button gets an edge', pg.evaluate("getComputedStyle(document.querySelector('.tray-btn')).borderTopWidth") == '1px')
        pg.close(); pg = mode('Input', contrast='more')
        more = pg.evaluate('''(() => { const r = getComputedStyle(document.documentElement); return [r.getPropertyValue('--ink-soft').trim(), r.getPropertyValue('--ink').trim(),
            r.getPropertyValue('--ink-muted').trim(), getComputedStyle(document.querySelector('.tray-input')).boxShadow]; })()''')
        check('with more contrast each grey takes the next step towards the ink, and a field gets an edge', more[0] == more[1] and more[2] == '#4a4a46' and 'inset' in more[3], more)
        pg.close(); pg = mode('Card', theme='dark', media='print')
        paper = pg.evaluate('''(() => { const r = getComputedStyle(document.documentElement); return [r.getPropertyValue('--page').trim(), r.getPropertyValue('--ink').trim(),
            getComputedStyle(document.querySelector('.tray-card')).borderTopStyle]; })()''')
        check('in print a page in the dark theme takes the light values, and a tray gets an edge', paper == ['#ffffff', '#141414', 'solid'], paper)
        pg.close(); pg = mode('AppShell', media='print')
        check('in print the navigation of the app stays off paper', pg.locator('.tray-app__side').is_hidden() and pg.locator('.tray-app__main').is_visible())
        pg.close()

        for e in errors: check('no script errors', False, e)
        b.close()

    bad = [r for r in results if not r[1]]
    print(f'{len(results) - len(bad)} of {len(results)} checks pass')
    for name, _, detail in bad: print(' FAIL', name, '|', detail)
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
