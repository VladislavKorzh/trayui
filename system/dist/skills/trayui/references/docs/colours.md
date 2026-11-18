# Colours

The 60 colour tokens in the Light and the Dark theme, and what each is for.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--page` | `#ffffff` | `#111110` | Page White / Night Page. The page ground, and the fill of controls that sit on a tray (`surface`). |
| `--surface` | `#f4f3f0` | `#1e1e1c` | Tray Grey / Night Tray. Every resting card, and the fill of inputs and controls that sit on `page` or `raised`. |
| `--raised` | `#ffffff` | `#262624` | Ground of floating panels: popover, menu, dialog, sheet, toast. Always with `shadow-float`. Added for overlays; the source page had none. |
| `--inverse` | `#141414` | `#2a2a27` | The one ink card that may anchor a group. Text on it is `on-inverse`, secondary text `on-dark-soft` and `on-dark-muted`. |
| `--accent` | `#ffd426` | `#ffd426` | The one loud colour: the primary action, and at most one large surface per screen. Tray Yellow in the Light and the Dark theme; every other theme has an accent of its own, always bright enough for ink text. Text on it is `on-accent`. |
| `--leaf` | `#dcebc8` | `#2a4032` | The single surface about where a product comes from. Text on it is `ink`, `ink-soft` or `ink-muted`. |
| `--scrim` | `rgba(20, 20, 20, 0.5)` | `rgba(0, 0, 0, 0.6)` | The veil behind a dialog, drawer or sheet. Added for overlays. |
| `--ink` | `#141414` | `#f4f3f0` | Primary text on `page`, `surface`, `raised` and `leaf`; selected states; the focus ring. At least 10:1 on each in every theme. |
| `--ink-soft` | `#4a4a46` | `#c9c7c0` | Secondary text on `page`, `surface`, `raised` and `leaf`. At least 6.6:1 in every theme. |
| `--ink-muted` | `#5c5c57` | `#a8a69f` | Captions and hints on `page`, `surface`, `raised` and `leaf`. At least 4.5:1 in every theme. |
| `--ink-hint` | `#6e6c66` | `#8f8d86` | The lightest text: axis ticks and placeholders on `page`, `surface` and `raised` (4.5:1 or more). Not for text on `leaf` or `inverse`, where it falls below 4.5:1. |
| `--on-accent` | `#141414` | `#141414` | All text and icons on `accent` (12.9:1). Never white. |
| `--on-inverse` | `#ffffff` | `#ffffff` | Primary text on `inverse` (14:1 or more). |
| `--on-dark-soft` | `#c9c7c0` | `#c9c7c0` | Secondary text on `inverse` (8.5:1 or more). |
| `--on-dark-muted` | `#a8a69f` | `#a8a69f` | Axis ticks and captions on `inverse` (5.9:1 or more). |
| `--on-dark-danger` | `#ff8e84` | `#ff8e84` | Error text and the danger fill on the ink card, where `danger` is too dark to read. |
| `--on-dark-success` | `#6fcf8a` | `#6fcf8a` | Success text on the ink card, where `success` is too dark to read. |
| `--on-dark-code-comment` | `#a0a7ae` | `#a0a7ae` | Comments, in a code block on the ink card. |
| `--on-dark-code-keyword` | `#ff8177` | `#ff8177` | Keywords and types (`const`, `return`, `<!DOCTYPE>`), in a code block on the ink card. |
| `--on-dark-code-string` | `#a5d6ff` | `#a5d6ff` | Strings, and the values of HTML attributes, in a code block on the ink card. |
| `--on-dark-code-function` | `#d2a8ff` | `#d2a8ff` | The names of functions and classes, in a code block on the ink card. |
| `--on-dark-code-tag` | `#7ee787` | `#7ee787` | HTML tag names and CSS element selectors, in a code block on the ink card. |
| `--on-dark-code-constant` | `#79c0ff` | `#79c0ff` | Attribute names, CSS properties and classes, numbers and literals, in a code block on the ink card. |
| `--on-dark-code-variable` | `#ffa657` | `#ffa657` | Built-in names (`document`, `console`), in a code block on the ink card. |
| `--on-danger` | `#ffffff` | `#141414` | Text on a `danger` fill, such as the destructive button (6.5:1 light, 8.3:1 dark). Added for that button. |
| `--hairline` | `#dedcd6` | `#2e2e2b` | The one rule colour: list dividers, table rows, form sections, chart gridlines. |
| `--rule-strong` | `#b5b3ac` | `#55554f` | A chart baseline, and the grip of a resizable split or a drawer. A decorative rule: it does not carry meaning alone. |
| `--track` | `#d9d7d0` | `#3a3a36` | The empty part of a meter, slider or progress bar; an inactive status chip; a skeleton. |
| `--control-off` | `#8a8882` | `#6e6c66` | An unselected radio ring or checkbox edge, and an off switch, on `page` and `surface` (3.1:1 or more). On `raised` it falls to 2.9:1 in the dark theme, so components use `ink-hint` there. |
| `--dark-rule` | `#2e2e2b` | `#3d3d39` | Gridlines and dividers on `inverse`. |
| `--inverse-off` | `#393936` | `#393936` | An inactive mark or chip on `inverse`, with `on-inverse` text. |
| `--danger` | `#b3261e` | `#ff8e84` | Error text, the 2px ring of an invalid field, the destructive button. On `page`, `surface` and `raised` (5.9:1 or more). Always with words or an icon. |
| `--success` | `#006300` | `#6fcf8a` | A positive change or a finished step, always with words or an icon. On `page`, `surface` and `raised` (6.8:1 or more). The dark value is added; the source had none. |
| `--data-1` | `#256abf` | `#3987e5` | First chart series. Data colours are used in this order, belong to a series and never to a rank, and appear nowhere outside charts. |
| `--data-2` | `#eb6834` | `#d95a2b` | Second chart series. |
| `--data-3` | `#1baf7a` | `#17a673` | Third chart series. Below 3:1 on light grounds, so its marks carry a label or the chart has a table view. |
| `--data-4` | `#eda100` | `#c28800` | Fourth and last chart series. Below 3:1 on light grounds: label it or give the table view. A fifth series folds into Other, drawn in `ink-hint`. |
| `--code-comment` | `#59636e` | `#a0a7ae` | Comments, in a code block on `page` and `surface`. GitHub's syntax colour, tuned to hold 4.5:1 on every ground. |
| `--code-keyword` | `#cb212d` | `#ff8177` | Keywords and types (`const`, `return`, `<!DOCTYPE>`), in a code block on `page` and `surface`. GitHub's syntax colour, tuned to hold 4.5:1 on every ground. |
| `--code-string` | `#0a3069` | `#a5d6ff` | Strings, and the values of HTML attributes, in a code block on `page` and `surface`. GitHub's syntax colour, tuned to hold 4.5:1 on every ground. |
| `--code-function` | `#7b4bd4` | `#d2a8ff` | The names of functions and classes, in a code block on `page` and `surface`. GitHub's syntax colour, tuned to hold 4.5:1 on every ground. |
| `--code-tag` | `#116329` | `#7ee787` | HTML tag names and CSS element selectors, in a code block on `page` and `surface`. GitHub's syntax colour, tuned to hold 4.5:1 on every ground. |
| `--code-constant` | `#0550ae` | `#79c0ff` | Attribute names, CSS properties and classes, numbers and literals, in a code block on `page` and `surface`. GitHub's syntax colour, tuned to hold 4.5:1 on every ground. |
| `--code-variable` | `#953800` | `#ffa657` | Built-in names (`document`, `console`), in a code block on `page` and `surface`. GitHub's syntax colour, tuned to hold 4.5:1 on every ground. |
| `--paper` | `#ffffff` | `#ffffff` | The light `page` under a fixed name: controls on `accent` surfaces and the fills of drawings. Same in every theme. |
| `--paper-ink` | `#141414` | `#141414` | The light `ink` under a fixed name: text and strokes on `accent` surfaces and in drawings. |
| `--paper-tray` | `#f4f3f0` | `#f4f3f0` | The light `surface` under a fixed name, on `accent` surfaces. |
| `--paper-soft` | `#4a4a46` | `#4a4a46` | The light `ink-soft` under a fixed name. On `accent` prefer `on-accent`. |
| `--paper-muted` | `#5c5c57` | `#5c5c57` | The light `ink-muted` under a fixed name. |
| `--paper-hairline` | `#dedcd6` | `#dedcd6` | The light `hairline` under a fixed name. |
| `--paper-track` | `#d9d7d0` | `#d9d7d0` | The light `track` under a fixed name; the shaded side of a drawn object. |
| `--paper-danger` | `#8f1d17` | `#8f1d17` | Error text and the danger fill on the yellow card, in every theme. |
| `--paper-success` | `#005200` | `#005200` | Success text on the yellow card, in every theme. |
| `--paper-code-comment` | `#59636e` | `#59636e` | Comments, in a code block on the yellow card, in every theme. |
| `--paper-code-keyword` | `#cb212d` | `#cb212d` | Keywords and types (`const`, `return`, `<!DOCTYPE>`), in a code block on the yellow card, in every theme. |
| `--paper-code-string` | `#0a3069` | `#0a3069` | Strings, and the values of HTML attributes, in a code block on the yellow card, in every theme. |
| `--paper-code-function` | `#7b4bd4` | `#7b4bd4` | The names of functions and classes, in a code block on the yellow card, in every theme. |
| `--paper-code-tag` | `#116329` | `#116329` | HTML tag names and CSS element selectors, in a code block on the yellow card, in every theme. |
| `--paper-code-constant` | `#0550ae` | `#0550ae` | Attribute names, CSS properties and classes, numbers and literals, in a code block on the yellow card, in every theme. |
| `--paper-code-variable` | `#953800` | `#953800` | Built-in names (`document`, `console`), in a code block on the yellow card, in every theme. |

[Themes](https://trayui.com/docs/themes.md) lists the other 8 themes, which give the same tokens other values.
