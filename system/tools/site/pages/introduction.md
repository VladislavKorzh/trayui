# Introduction

Tray UI is a design system for products and the pages around them, written in plain HTML and CSS, with one small script for behaviour.

## What it looks like

A clean, well-lit shop counter: a white page, black type that says the thing plainly and large, and goods set out in soft grey trays with very round corners. One yellow marks the thing to do. Nothing is outlined, shadowed or decorated; surfaces are told apart by flat fills alone. [The brand book](#g-brand) holds the rules in one page.

## What is in it

| Part | What you get |
| --- | --- |
| [Components](#components) | {{components}} of them, from a button to a data table: forms, navigation, overlays, data, conversation, and the frame of a product (app shell, billing, account, onboarding, public pages). |
| [Blocks](#blocks) | {{blocks}} screens to copy: a dashboard, tables, a shop and a checkout, articles, a blog, a wiki, the sidebar in fifteen variants, sign-in and sign-up pages. |
| [Charts](#charts) | {{charts}} charts for React, drawn with Recharts in the style of the system: area, bar, line, pie, radar and radial. |
| [Foundations](#f-colours) | {{tokens}} tokens for colour, type, space and shape, {{themes}} [themes](#d-themes), and {{icons}} icons from Lucide. |

## How it works

- **Three files.** `tokens.css` declares every token as a custom property, `components/bundle.css` holds the classes, `components/bundle.js` wires up behaviour. Together they are {{kb}} KB when compressed. There is no framework and no build step.
- **Classes on plain HTML.** A button is `<button class="tray-btn">`. Every class starts with `tray-`; the type styles are classes too (`display`, `title`, `body`).
- **Behaviour by attribute.** What needs a script (a menu, a calendar, a chart) takes `data-tray="menu"` on its element and wires itself. Most components need none. [Styles and behaviour](#g-behaviour) lists them all.
- **Grounds.** A surface tells its children what they sit on: put a field in a card and it turns white. You do not set those fills by hand. [Grounds and nesting](#g-grounds) explains it.
- **{{themes}} themes.** Set `data-theme` on `<html>`: `light`, `dark` and eight more, or one you make. Each has its own values, picked against its own page; none is another one inverted. See [Themes](#d-themes).

## Where to start

1. [Install](#d-installation) the three files.
2. Read [the brand book](#g-brand): ten minutes that save the most mistakes.
3. Copy a [block](#blocks) and replace its content.
4. Look up each [component](#components) as you need it: every page has a live example, its markup, and when to use it.

The names in the examples (Counter, an order desk, and Perly Farm, a snail-caviar farm that uses it) are invented, and so is every figure and quote.
