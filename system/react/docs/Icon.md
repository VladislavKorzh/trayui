---
category: Display
keywords: [icon, glyph, svg, lucide, react-icons]
---
# Icon

An icon in the colour of the text around it. The system's icons are Lucide's: the ones built in go by name, and any other comes from `react-icons/lu`.

## Use
```tsx
<Icon name="truck" />
<Icon name="circle-check" className="tray-success" />     {/* colour comes from the text colour */}
<Icon name="arrow-right" flip />                          {/* mirrors in right-to-left pages */}
<Icon name="bell" size="lg" label="Notifications" />      {/* label only when nothing beside it says the same */}
```

The built-in names are Lucide's own: arrows and chevrons (`arrow-left`, `arrow-right`, `arrow-up-down`, `chevron-down`, `chevrons-up-down`), actions (`plus`, `minus`, `x`, `check`, `search`, `filter`, `copy`, `pencil`, `trash-2`, `download`, `upload`, `share`, `send`, `rotate-cw`, `ellipsis`, `ellipsis-vertical`, `log-in`, `log-out`), status (`info`, `circle-help`, `triangle-alert`, `circle-alert`, `circle-check`, `circle-x`, `lock`, `eye`, `bell`, `star`, `trending-up`, `trending-down`), things (`house`, `inbox`, `file`, `folder`, `image`, `mail`, `calendar`, `clock`, `map-pin`, `user`, `users`, `user-plus`, `settings`, `credit-card`, `receipt-text`, `shopping-bag`, `truck`, `package`, `key`, `shield`, `plug`, `chart-column`, `megaphone`), and `sun`, `moon`. The type `IconName` lists every one.

## Any other Lucide icon
Install `react-icons` and pass the icon as an element. It works wherever a component takes an icon, and it gets the size, the stroke and the colour of the built-in ones.

```tsx
import { LuRocket, LuBird } from 'react-icons/lu';

<Icon name={<LuRocket />} size="lg" />
<Button icon={<LuRocket />}>Launch</Button>
<Badge icon={<LuBird />}>Bird</Badge>
```

Every `icon` prop in the package has the type `IconSource`: a built-in name, or an element. Stay with Lucide (`react-icons/lu`): icons from another family have another weight and another grid, and do not sit well beside these.

## Do and don't
- Do pair an icon with a word wherever there is room.
- Do use `size="sm"` inside badges and captions, `lg` in empty states.
- Don't draw an icon in a colour of its own; set the colour of the text around it.
- Don't mix icon families, and don't use emoji in place of icons.
