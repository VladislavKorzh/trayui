# Icons

The icons of the system are [Lucide](https://lucide.dev)'s: drawn on a 24px grid with round caps and round joins, and no fills. The ones built in are those the components and blocks use; they keep Lucide's names. Each file here is a single-ink SVG in `paper-ink` (#141414), so it reads on `page`, `surface` and `accent`.

In product markup do not load these files. Use the sprite that `components/bundle.js` adds to the page, which takes the colour of the text around it and works in every theme:

```html
<svg class="tray-icon" aria-hidden="true"><use href="#tray-i-search"/></svg>
```

An icon is 20px with a 2px stroke. `tray-icon--sm` is 16px and `tray-icon--lg` 28px; the stroke scales with the box. Add `tray-icon--flip` to an icon that points along the reading direction (arrows, chevrons, send) so it mirrors in right-to-left pages.

- Arrows and chevrons: `arrow-left`, `arrow-right`, `arrow-up`, `arrow-down`, `arrow-up-right`, `arrow-up-down`, `chevron-left`, `chevron-right`, `chevron-up`, `chevron-down`, `chevrons-up-down`.
- Actions: `plus`, `minus`, `x`, `check`, `search`, `filter`, `copy`, `pencil`, `trash-2`, `download`, `upload`, `share`, `send`, `rotate-cw`, `link`, `external-link`, `ellipsis`, `ellipsis-vertical`, `grip-vertical`, `menu`, `log-in`, `log-out`.
- Status: `info`, `circle-help`, `triangle-alert`, `circle-alert`, `circle-check`, `circle-x`, `circle`, `loader-circle`, `lock`, `eye`, `eye-off`, `bell`, `star`, `heart`, `bookmark`, `thumbs-up`, `thumbs-down`, `zap`, `sparkle`, `shield`, `shield-check`, `flag`, `trending-up`, `trending-down`.
- Things: `house`, `inbox`, `file`, `folder`, `image`, `paperclip`, `mail`, `phone`, `message-square`, `calendar`, `clock`, `map-pin`, `globe`, `user`, `users`, `user-plus`, `settings`, `credit-card`, `shopping-bag`, `truck`, `terminal`, `code`, `git-branch`, `mic`, `play`, `pause`, `key`, `building`, `chart-column`, `plug`, `receipt-text`, `tag`, `layers`, `database`, `gift`, `book`, `monitor`, `life-buoy`, `megaphone`, `package`.
- Signs: `at-sign`, `hash`, `percent`, `dollar-sign`.
- Layout and text: `panel-left`, `columns-2`, `layout-grid`, `list`, `bold`, `italic`, `underline`, `align-left`, `align-center`, `align-right`.
- Theme: `sun`, `moon`.

## Any other Lucide icon

Lucide has more than 1,500 icons, and any of them fits beside these.

- In plain HTML, copy the icon's SVG from lucide.dev and give it the class: `<svg class="tray-icon" viewBox="0 0 24 24" aria-hidden="true">…</svg>`. The class sets the size, the stroke and the colour.
- In React, import it from `react-icons/lu` and pass it wherever a component takes an icon: `<Button icon={<LuRocket />}>`.
- To build one into the sprite, add its name to `ICONS` in `tools/lucide.py` and run that script, then the build.

Lucide is under the ISC licence, and some of its icons come from Feather under the MIT licence: `LICENSE.txt` in this folder.
