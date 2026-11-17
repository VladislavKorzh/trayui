# Typography

One grotesque, Onest, in two voices: weight 700 with tight tracking for anything that names, weight 400 with open leading for anything that explains.

## Styles
Each style is a class with the same name as its token: `display`, `headline`, `title`, `subtitle`, `figure`, `lead`, `body`, `caption`, `tick`, `action`, `control`, `nav`, `label`, `code`, `kbd`. The five heading styles are fluid: their size comes from `display-size`, `headline-size`, `title-size`, `subtitle-size` and `figure-size`.

| Style | Use |
| --- | --- |
| `display` | The page headline, once per page. |
| `headline` | Section headings; the title of a lead card. |
| `title` | The heading inside a large card or a dialog. |
| `subtitle` | List items, steps, accordion questions, chart and card titles. |
| `figure` | One large numeral in a card, its unit at `title` size (`tray-figure`). |
| `lead` | The sentence under a headline, in `ink-soft`. |
| `body` | Everything that explains. |
| `caption`, `tick` | Hints, dates, keys; axis ticks and marks. |
| `action`, `control`, `nav`, `label` | Interface text, largest to smallest. |

## Helpers
`tray-prose` sets a reading column (`measure`, 38rem) with paragraph and heading spacing. `tray-soft`, `tray-muted` and `tray-hint` set the three secondary inks. `tray-code-inline` marks code in a sentence; `tray-quote` sets a quotation in `lead` with its source beneath; `tray-list-plain` is a plain bulleted list.

## Rules
- Headlines are short statements in sentence case (the Plain Sentence Rule). No capitals for emphasis, no tracked labels above headings.
- No italics and no serif anywhere.
- Never set text lighter than `ink-hint` on `page` or `surface`.
- Pick the element for meaning (`h1` to `h3`, `p`) and the class for looks; the two are independent.

## Accessibility
The styles are classes and change only how text looks: a screen reader knows a heading by its element, not by its size, so the outline of a page comes from its `h1` to `h3` whatever style each one wears. The fluid sizes of the five heading styles are `clamp()`s whose middle term has a `rem` part as well as a `vw` part, and whose ends are in `rem`, so they grow with the browser's zoom and its text size all along their range, not only at their ends (WCAG 1.4.4). `ink`, `ink-soft` and `ink-muted` read at 4.5:1 or more on `page`, `surface`, `raised` and `leaf` in every theme. `ink-hint` holds that on `page`, `surface` and `raised` only.
