---
category: Display
keywords: [item, list item, row, list, menu row, settings row, list tile, cell]
---
# Item

An item is one row of a list: a media tile, a title with a line of detail, and something at the end.

## Use
```tsx
<ul className="tray-items">                                     {/* grey rows, 8px apart */}
  <Item href="/orders/PL-20418" icon="truck" title="Order PL-20418" text="Two jars of 50 g, out for delivery"
        end={<Icon name="chevron-right" flip />} />           {/* the whole row is a link */}
  <Item media={<Avatar initials="OF" />} title="Oksana Franko" text="Farm manager" end={<Badge tone="accent">On shift</Badge>} />
</ul>

<ul className="tray-items tray-items--ruled">                     {/* no fill, hairlines between rows */}
  <Item icon="file" title="Receipt, 14 November" text="PDF, 84 KB"
        end={<Button variant="ghost" size="xs" icon="download" aria-label="Download the receipt" />} />
  <Item size="sm" icon="map-pin" title="Farm shop" end="2.4 km" />
</ul>

<Item as="div" icon="bell" title="Order updates" onClick={openSettings} /> {/* a single row, a button */}
```

## Lists
Items live in a list. `<ul className="tray-items">` gives filled grey rows with 16px corners, 8px apart. `<ul className="tray-items tray-items--ruled">` drops the fills and separates the rows with hairlines, for long lists on the page. `size="sm"` is the compact row. Don't mix filled and ruled rows in one list.

## Parts
- The start: `icon` for an icon in a tile, or `media` for an Avatar or a picture.
- `title` on one line, and `text`, one line of detail in muted ink.
- `end` takes one thing: a value (set in tabular figures), a Badge, a switch, a small ghost button, or a chevron when the row goes somewhere.

With `href` the whole row is a link; with `onClick` it is a button. Either darkens slightly on hover.

## Do and don't
- Do keep the title to one line and the detail to one line.
- Do put one thing at the end.
- Don't put a row of buttons in an item; open a menu from a single "more" button.
