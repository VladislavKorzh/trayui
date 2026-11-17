---
category: Display
keywords: [typography, text, heading, type, font, type scale, display, headline, title, body, caption, label]
---
# Typography

Typography sets text in one of the system's type styles: one grotesque, Onest, weight 700 with tight tracking for anything that names, weight 400 with open leading for anything that explains.

## Use
```tsx
<Typography variant="display">White caviar</Typography>                 {/* an h1, once per page */}
<Typography variant="lead" tone="soft">Raised, collected by hand and packed on our own farm.</Typography>
<Typography variant="headline">How to tell it</Typography>              {/* an h2 */}
<Typography variant="subtitle" as="h3">From soil to jar</Typography>
<Typography variant="figure" unit="%">88</Typography>                   {/* one large numeral, its unit beside */}
<Typography>By day the beds look empty.</Typography>                    {/* body, a p */}
<Typography variant="caption" tone="muted" as="span">Courier delivery in a chilled box.</Typography>
<Typography variant="code">const jar = order.items[0];</Typography>
```

## Styles
| Style | Use |
| --- | --- |
| `display` | The page headline, once per page. |
| `headline` | Section headings; the title of a lead card. |
| `title` | The heading inside a large card or a dialog. |
| `subtitle` | List items, steps, accordion questions, chart and card titles. |
| `figure` | One large numeral in a card, its `unit` at `title` size. |
| `lead` | The sentence under a headline, in soft ink. |
| `body` | Everything that explains (the default). |
| `caption`, `tick` | Hints, dates, keys; axis ticks and marks. |
| `action`, `control`, `nav`, `label` | Interface text, largest to smallest. |
| `code`, `kbd` | Code, and a key of a shortcut, in the mono face. |

The five heading styles are fluid: they shrink on small screens. `tone` sets one of the three secondary inks: `soft`, `muted`, `hint`.

## Element and style
The style sets the looks and `as` sets the meaning; the two are independent. Each style has a sensible element (`h1` for display, `h2` for headline and title, `h3` for subtitle, `p` for text), so change `as` when the outline of the page needs another level.

## Prose
For a reading column, wrap paragraphs in `<div className="tray-prose">` (38rem, paragraph and heading spacing). Inside it, `tray-code-inline` marks code in a sentence, `tray-quote` sets a quotation with its `<cite>` beneath, and `tray-list-plain` is a plain bulleted list.

## Do and don't
- Do write headlines as short statements in sentence case. No capitals for emphasis, no tracked labels above headings.
- Do pick the element for meaning and the style for looks.
- Don't use italics or a serif anywhere.
- Don't set text lighter than `hint`.
