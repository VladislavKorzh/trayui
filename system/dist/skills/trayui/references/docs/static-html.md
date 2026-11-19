# Static HTML from React

Write a page once in React and ship it as plain HTML that works with no React in the browser: `renderToStaticHTML` from `trayui-react/static` writes the plain-HTML system's markup, and the system's own `bundle.js` gives it its behaviour.

## When to use it

For a page that is built ahead of time and served as files: a marketing site, a help centre, a set of templates you hand to people who do not use React. You keep one source, written with the React components, and get two results from it: the React app, and HTML pages that open from a folder or any static host.

It is not server rendering for a React app. A page made this way is never hydrated, and a Server Component must not import the entry. For a Next.js app, import the components as usual (see [React](https://trayui.com/docs/react.md)).

## How to render a page

Render each page in Node, at build time, and put the result inside an HTML page that links the three files of the plain-HTML system from the package `trayui`.

```tsx
// build.tsx, run in Node
import { writeFileSync } from 'node:fs';
import { renderToStaticHTML } from 'trayui-react/static';
import { Card, Tabs } from 'trayui-react';

const body = renderToStaticHTML(
  <Card title="Order PL-20418">
    <Tabs label="Order PL-20418" items={[
      { value: 'items', label: 'Items', content: <p>Two jars of 50 g</p> },
      { value: 'delivery', label: 'Delivery', content: <p>Tomorrow, 14:00 to 18:00</p> },
    ]} />
  </Card>,
);

writeFileSync('order.html', `<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Order PL-20418</title>
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="components/bundle.css">
</head>
<body>
${body}
<script src="components/bundle.js"></script>
</body>
</html>`);
```

Render the whole page as one tree, so the ids that link labels to fields are unique on it. Pass `identifierPrefix` when two trees end up on one page.

## What works in the page

Every component writes the same markup it writes in the plain-HTML system, `data-tray` included, and `bundle.js` does the rest:

- tabs switch, and a strip of tabs scrolls its current tab into view;
- dialogs, alert dialogs, sheets and drawers open and close, and one can be open as the page loads;
- sidebars collapse, and the app shell's sidebar becomes a sheet on a phone;
- filter bars turn choices into chips;
- calendars and date pickers pick;
- charts are drawn by the system's own chart from the same data;
- toggles, the notification centre, the password's Show button, a mixed checkbox and a file upload's list and size limit all work;
- menus, selects, comboboxes, the command palette, tooltips, carousels and the rest, whose behaviour was the system's own already.

What the tree's state shows at first is what the page shows. After that `bundle.js` keeps the state, and changes come as `tray:*` events, not through the props' callbacks: listen with `addEventListener('tray:change', …)` in your page's own script.

## What stays your page's own

The plain-HTML system has no behaviour for these, so in a static page your own script does them, as it would in a page written by hand:

- **Forms.** A form rendered this way has no `onSubmit`; the browser would send it as a GET, with its fields in the address. Give every form `method="post"` and an `action`, and handle `submit` in your script.
- **Pagination.** Make each page a link to a page of its own, or move the rows in your script.
- **State your page computes**, such as a total that follows a choice, or the label of a Workspace Switcher after a choice.
- **The Remove button of a file** a File Upload starts with.

## Charts

A Chart is drawn by the system's own chart, from the same data and props. A chart that one cannot draw stops the render with an error that says why, rather than drawing something else: a chart composed in `ChartContainer`, a radial chart with more than three rings, a stacked line, or a value that is not a number or is below zero.

## How it is checked

Each of these components has a parity check among the component tests. Its React preview is rendered in static mode, put in a page with the three files, and driven in Chrome beside the React page: the same presses and keys must give the same accessibility tree, focus and events, and the page without `bundle.js` must not, which proves the behaviour comes from the system. The default render, outside static mode, is checked to be unchanged byte for byte.

The checks run in the Light theme in Chrome. Other themes, right to left, forced colours and screen readers have not been tested in static mode yet.
