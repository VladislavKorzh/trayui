# The brand book

The rules of the system in one page: content, colour, type, shape, layout, motion and icons.

Tray UI is a clean, well-lit shop counter: a white page, black type that says the thing plainly and large, and goods set out in soft grey trays with very round corners. One yellow marks the thing to do. Nothing is outlined, shadowed or decorated; surfaces are told apart by flat fills alone.

Build with it in this order: pick the ground, set the type, place one yellow action, then reach for components.

## Content

- Write short plain statements in sentence case. Headlines are facts: "Our snails grow in the open air", "How to tell it". No capitals for emphasis, no tracked labels above headings, no exclamation marks.
- Buttons start with a verb and name the outcome: "Order a jar", "Save the day", "Keep the order". Never "OK", "Submit" or "Yes".
- Speak as "we" for the company and "you" for the reader. Say what happens next: "The courier calls ten minutes before arriving."
- Errors say what to do: "Enter the phone number with its area code." Never "Invalid value".
- Numbers carry their unit and stand next to what they measure: "22 kg in May", "132 of 412 jars left". Label demo figures as demo data.
- No emoji, no italics, no serif, no superlatives.

## Colour

A neutral system with one loud colour.

- The page is `page`. Every resting card is `surface` (Tray Grey). A control that sits on a tray takes `page` again. That alternation, white, grey, white, is the whole depth model.
- Text is `ink`. Secondary text steps down through `ink-soft` and `ink-muted`; `ink-hint` is the lightest allowed, for axis ticks and placeholders only.
- `accent` (Tray Yellow) is for the primary action and for at most one large surface per screen. Two large yellow surfaces in view means one is wrong. Text on yellow is always `on-accent`, never white.
- Selected is solid `ink` with page-coloured text: the current tab, the chosen segment, a checked box, a picked day, your own message. Yellow never means "selected".
- `inverse` is the one ink card that may anchor a group. `leaf` is the single surface about where a product comes from.
- `danger` and `success` are for text and icons that come with words: an error under a field, "Paid" in a badge. The only danger fill is the destructive button, with `on-danger` text.
- `data-1` to `data-4` belong to chart series, in that order, and appear nowhere else. One series alone is drawn in `ink`, or in `accent` on an ink card.
- `code-comment`, `code-keyword`, `code-string`, `code-function`, `code-tag`, `code-constant` and `code-variable` are GitHub's syntax colours, for code in a code block and nowhere else. They colour highlight.js's classes; on the ink card and the yellow card they take their own steps by themselves.
- Floating panels (menu, popover, dialog, toast) are `raised` with `shadow-float`, over `scrim` when they block the page.

### Themes

Set `data-theme` on `<html>`, or on any element to theme what is inside it. Ten themes come with the system: `light` and `dark`, tuned by hand, and `linen`, `mint`, `sky`, `rose`, `lilac`, `midnight`, `forest` and `espresso`, derived from them by the same rules. Each has its own steps, chosen against its own page, not a flip of another one, and its own `accent`, always bright enough for ink text: yellow in Light and Dark. Accent surfaces, and everything on them, keep the light palette in every theme (the Island Rule): use the `paper` tokens there, which the `tray-card--accent` class does for you. Never build a dark variant by inverting colours: derive it, and measure it.

## Type

One family, Onest, in two voices: weight 700 with tight tracking for anything that names, weight 400 with open leading for anything that explains. Use the style classes by name.

- `display` once per page; `headline` for sections; `title` inside a large card or dialog; `subtitle` for list items, questions and chart titles.
- `figure` for one large numeral in a card, with its unit at `title` size on the same baseline.
- `lead` under a headline, in `ink-soft`; `body` for everything else, in a column no wider than `measure`.
- Interface text: `action` (large buttons), `control` (segments, typed values), `nav` (tabs, menus, table rows), `label` (field labels, badges, table heads).
- `caption` for hints and dates; `tick` for axis ticks and marks; `code` and `kbd` in the mono stack.

The five heading styles are fluid: their sizes come from `display-size`, `headline-size`, `title-size`, `subtitle-size` and `figure-size`.

## Shape and depth

- Corners are very round and step down with nesting: `radius-card` 40, `radius-panel` 28, `radius-button` 20, `radius-input` 16, `radius-control` 14, `radius-chip` 12. Chart marks and the checkbox end in `radius-mark` 4. `radius-pill` is for meters, sliders and the switch only. Nothing has a hard corner, and nothing is a circle except the switch knob, the radio and the slider knob.
- Flat. No borders and no shadows on resting surfaces. A ring appears only as state: 2px `ink` for a selected choice or a focused field, 2px `danger` for an invalid field, 3px `ink` 3px out for keyboard focus (the No-Outline Rule).
- `shadow-float` is the only shadow, for things that float above the page.
- `hairline` is the only rule: list dividers, table rows, form sections, gridlines. `rule-strong` is a chart baseline.

## Layout

- One centred container, `container` wide at most, with `page-pad` at the edges and `section-gap` between sections.
- Cards sit in a 12-column bento on the 16px `grid-gap` and take unequal widths, usually two to one. Below 56rem every card is full width.
- Card padding is `card-pad`. Space inside components comes from the `space-` steps; the gap between a tray and what it holds is `space-1`.
- Sizes: `size-lg` 64 for the main action, `size-md` 56 for fields, `size-sm` 48 in headers and toolbars, `size-xs` 40 in dense rows. A finger's target is at least `size-hit` 44, all but a few: the nested links of a sidebar, the rows of a file tree and the labels of a sidebar's folding sections are 36px rows as wide as the sidebar, the Slider is 28px tall, and the handle of Resizable is a 16px strip (the accessibility guide names them).

## Motion

Every change answers the hand that made it, and nothing moves on its own.

- A press answers at once: a button scales to 0.97, a checkbox and a radio give a little, a switch's knob stretches (`duration-press`).
- A change of state eases its fill (`duration-fill`); a choice slides to its place: the pill of a segmented control or a strip of tabs, the switch's knob (`duration-move`).
- What appears comes in from where it belongs over `duration-in` on `ease`: a menu, popover or listbox opens from the corner that touches its trigger, a dialog rises 12px and settles, a sheet comes in from its edge, a drawer from the foot, a toast rises, an accordion's answer unfolds, a field's error comes in under it, a tick draws itself.
- What goes away leaves quicker, over `duration-out` on `ease-exit`, so a closed thing is out of the way at once.
- Only an answer in place overshoots a little (`ease-spring`): a count that changes bumps, "Copied" pops in.
- For a visitor who asks for reduced motion, overlays fade in a tenth of a second and everything else changes at once.

## Modes

A person who asks for more contrast gets darker greys and an edge on every fill. With forced colours (Windows high contrast) every fill becomes an edge and what is chosen takes the system's own colour for it. On paper the page is always the light theme, trays outlined, the navigation left out. Mark what must stay off paper with `tray-noprint`.

## Logo

The mark is a Tray Yellow tile with an ink bar set on it: a tray with one thing on it. It stands before the name, which is set in type (`tray-wordmark`), at about 1.25 times the size of the type and 10px away. The file is in the Logos asset group.

- Keep it whole and upright, with clear space of a quarter of its width around it; never smaller than 16px.
- On a page in another theme the tile takes that theme's `accent` and the bar stays ink, so the page keeps one loud colour. Do not set the mark on `accent`.
- Where the mark is a link it may move a little: the bar is set down once when the page opens, lifts under the pointer and gives when pressed. It does not move for a visitor who asks for reduced motion.

## Icons

The icons are Lucide's (lucide.dev): strokes with round caps and joins, 20px with a 2px stroke, in the colour of the text beside them. Over a hundred are built in, by Lucide's names (src/icons.json lists them); any other Lucide icon fits beside them. Use `<svg class="tray-icon"><use href="#tray-i-name"/></svg>`; the bundle adds the sprite. The same drawings are in the Icons asset group as single-ink SVG files. An icon never replaces a label except in an icon button, which then carries an `aria-label` and a Tooltip. Icons that point along the reading direction take `tray-icon--flip` so they mirror in right-to-left pages.

A product built with the system that has no mark of its own sets its name in type with `tray-wordmark`, as the blocks do.

## Components

Every component is plain HTML with `tray-` classes from `components/bundle.css`; behaviour comes from `components/bundle.js`, which wires up elements that carry a `data-tray` attribute. Read a component's guidelines before using it: they say which classes, which attributes and which ARIA it needs.

- A surface tells its children what they sit on. Put a field in a `tray-card` and it turns white; put it in a `tray-panel` inside that card and it turns grey again. Do not set those fills by hand.
- Prefer the element the browser already has: `<details>` for Accordion and Collapsible, `<dialog>` for Dialog, Sheet and Drawer, real radios and checkboxes inside Toggle Group, Checkbox, Radio Group and Switch.
- One primary button per view. Everything else is quiet, ghost or a link.
- A product is framed by the application set: App Shell, Top Bar and Page Header hold every screen; metrics, billing, account and onboarding blocks are built from the base components and keep their rules. `tray-island` makes any of those blocks the yellow one and `tray-inverse` the ink one.
- Whole screens come ready made: `blocks/` holds screens to copy (a dashboard, tables, a shop, articles, a wiki, the sidebar in each of its variants, sign-in and sign-up pages). Start a new screen from the nearest one. Page layouts says how their frames work; Blocks lists them.
- Sample content in the application set is about Counter, an invented order desk used by the invented Perly Farm. Replace it; never ship its names, prices or quotes.

## Intentional additions

The source of this system is one product landing page with a journal. These parts go beyond it, at the owner's request for a full component set:

- Tokens: `raised`, `scrim`, `on-danger`, the dark value of `success`, the dark value of `shadow-float`, the `size-md` and `size-xs` control heights, the `space-` scale as a named scale, the mono stack, and the dark steps of `data-1` to `data-4` (validated for colour-vision separation on the dark tray).
- Components the page did not have: overlays (dialog, sheet, drawer, popover, hover card, tooltip, menus, toast), application navigation (sidebar, menubar, command, breadcrumb, pagination), data (data table, the chart types beyond bars and a line), the conversation set (message, bubble, scroller, attachment, marker, questionnaire, trace, code block), and form controls beyond the order form (select, combobox, slider, one-time code, calendar, date picker).
- The application set, asked for after the first version: the frame of a product (app shell, top bar, page header, workspace switcher, user menu, notification centre, filter bar, stepper, banner), metrics (stat card, usage meter, activity feed, description list, uptime), billing (pricing table, plan comparison, billing summary, payment method, invoice list, checkout summary, upgrade prompt), account (auth form, team members, invite form, API keys, settings section, integration card, notification preferences), onboarding (checklist, tour, feedback widget, changelog, cookie consent), two more form controls (tag input, file upload) and the blocks of a public page (hero, feature grid, testimonial, call to action, footer). They add no tokens.
- Blocks, asked for after the application set, in the manner of the block galleries of component libraries: whole pages built only from the components. For them the app shell and the sidebar gained variants (inset, a header across the product, a sidebar at the end or on both sides, two sidebars, groups and second levels that fold, a tree) and pages outside the shell gained a frame (`tray-screen`). They add no tokens.
- Icons: the page drew only plus, minus, check, a chevron, a sun and a moon; the system uses Lucide's set, which has the same round stroke.
