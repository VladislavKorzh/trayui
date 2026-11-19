# Introduction

Tray UI is a design system for products and the pages around them, written in plain HTML and CSS, with one small script for behaviour.

## What it looks like

A clean, well-lit shop counter: a white page, black type that says the thing plainly and large, and goods set out in soft grey trays with very round corners. One yellow marks the thing to do. Nothing is outlined, shadowed or decorated; surfaces are told apart by flat fills alone. [The brand book](https://trayui.com/docs/brand-book.md) holds the rules in one page.

## What is in it

| Part | What you get |
| --- | --- |
| [Components](https://trayui.com/components.md) | 108 of them, from a button to a data table: forms, navigation, overlays, data, conversation, and the frame of a product (app shell, billing, account, onboarding, public pages). |
| [Blocks](https://trayui.com/blocks.md) | 64 screens to copy: a dashboard, tables, a shop and a checkout, articles, a blog, a wiki, the sidebar in fifteen variants, sign-in and sign-up pages. |
| [Charts](https://trayui.com/charts.md) | 58 charts for React, drawn with Recharts in the style of the system: area, bar, line, pie, radar and radial. |
| [Foundations](https://trayui.com/docs/colours.md) | 116 tokens for colour, type, space and shape, 10 [themes](https://trayui.com/docs/themes.md), and 118 icons from Lucide. |

## How it works

- **Three files.** `tokens.css` declares every token as a custom property, `components/bundle.css` holds the classes, `components/bundle.js` wires up behaviour. Together they are 90 KB when compressed. There is no framework and no build step.
- **Classes on plain HTML.** A button is `<button class="tray-btn">`. Every class starts with `tray-`; the type styles are classes too (`display`, `title`, `body`).
- **Behaviour by attribute.** What needs a script (a menu, a calendar, a chart) takes `data-tray="menu"` on its element and wires itself. Most components need none. [Styles and behaviour](https://trayui.com/docs/behaviour.md) lists them all.
- **Grounds.** A surface tells its children what they sit on: put a field in a card and it turns white. You do not set those fills by hand. [Grounds and nesting](https://trayui.com/docs/grounds.md) explains it.
- **10 themes.** Set `data-theme` on `<html>`: `light`, `dark` and eight more, or one you make. Each has its own values, picked against its own page; none is another one inverted. See [Themes](https://trayui.com/docs/themes.md).

## Where to start

1. [Install](https://trayui.com/docs/installation.md) the three files.
2. Read [the brand book](https://trayui.com/docs/brand-book.md): ten minutes that save the most mistakes.
3. Copy a [block](https://trayui.com/blocks.md) and replace its content.
4. Look up each [component](https://trayui.com/components.md) as you need it: every page has a live example, its markup, and when to use it.

The names in the examples (Counter, an order desk, and Perly Farm, a snail-caviar farm that uses it) are invented, and so is every figure and quote.
