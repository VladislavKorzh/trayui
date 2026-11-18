# Tray UI for AI agents

A skill that teaches an agent to build screens with [Tray UI]({{site}}) {{version}}, the design system in plain HTML and CSS: {{components}} components, {{blocks}} blocks and {{themes}} themes, with one small script for behaviour.

With it an agent starts a screen from the nearest block, copies each component's markup and ARIA from its guidelines, follows the brand book (one yellow per view, tokens instead of literal values, words that say what a button does), and checks what it wrote with the checker that comes with it before it hands the page over.

## What is in it

- `SKILL.md`: how to build with the system, in one page.
- `references/`: every page of {{site}} as Markdown, by the same path (`references/components/button.md` is {{site}}/components/button.md): the guidelines and markup of every component, every block as a whole page of HTML with a note on when to choose it, the brand book, the layouts, the behaviours, accessibility and the tokens.
- `scripts/check.mjs`: the markup checker, with no dependencies (Node 18 or later): `node scripts/check.mjs page.html`. Its rules, `scripts/rules.json`, are written from the same release of the stylesheet and the script.

It reads nothing from the network and runs nothing by itself.

## Install it

- **Claude Code:** `claude plugin marketplace add {{site}}/skills/marketplace.json`, then `claude plugin install trayui@trayui`.
- **claude.ai:** download [trayui.zip]({{site}}/skills/trayui.zip) and upload it under Settings, Capabilities, Skills.
- **Any agent that reads skills:** copy the `trayui` folder of the zip, or `node_modules/trayui/skills/trayui` after `npm install trayui`, into the project's `.claude/skills/` or `.agents/skills/`.

{{site}}/docs/skill says more.

## Licence

{{license}}. The typeface and the icons the pages name are under their own licences ({{site}}/docs/installation). The name Tray UI and its logo are not covered by the licence.
