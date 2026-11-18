# React

The same {{components}} components as typed React components, over the same stylesheet and the same behaviours.

## Where it is

{{#npm}}The package is called `trayui-react`, and it is on npm. It needs `react` and `react-dom`; the charts also need `recharts`.

```sh
npm install trayui-react
```

Its source is the `system/react` folder of the repository{{#repo}} ([open it]({{repo}})){{/repo}}.{{/npm}}{{^npm}}The package is called `trayui-react`. It is not on npm yet: it is the `system/react` folder of the repository{{#repo}} ([open it]({{repo}})){{/repo}}.{{^repo}} The repository is not public yet, so for now the package cannot be downloaded from here.{{/repo}} Build it there with `npm install` and `npm run build`, then add it to a project as a local package.{{/npm}}

## Use it

```tsx
import { Button, Card, Field, Input } from 'trayui-react';
import 'trayui-react/styles.css';

export function OrderForm() {
  return (
    <Card title="Order a jar">
      <Field label="Delivery address">
        <Input autoComplete="street-address" />
      </Field>
      <Button type="submit">Order a jar</Button>
    </Card>
  );
}
```

- `styles.css` carries the tokens, every component style and the font. No provider or wrapper is needed.
- Each component renders the markup and the classes of its plain-HTML original, so a page built in React and a page built by hand look the same.
- Props are typed and documented; variants are named after the modifiers of the classes (`variant="quiet"`, `size="sm"`).
- Components wire their own behaviour. Never write `data-tray` attributes by hand in React: use the component.
- Icons are Lucide's. The {{icons}} built into the system go by name, typed: `<Icon name="truck" />`, `<Button icon="truck">`. Any other one comes from `react-icons/lu` as an element, wherever a component takes an icon: `<Button icon={<LuRocket />}>`. See [Icons](#f-icons).

## Charts

Charts in React are drawn by Recharts and come from an entry of their own, `trayui-react/charts`, so the rest of the package does not depend on a chart library. Install `recharts` next to the package and import from there:

```tsx
import { Chart, ChartContainer, ChartTooltip } from 'trayui-react/charts';
```

`Chart` is the ready-made component for the six usual forms; `ChartContainer` and the parts around it are for a Recharts chart you compose yourself. [Charts](#charts) has {{charts}} examples to copy, and [Using the charts](#ch-use) explains the parts.

## Blocks, and source you own

The {{blocks}} blocks exist in React too, as components with the same markup and classes as the HTML pages: `npx trayui add login-01` copies `Login01` into your app, with what it needs, and the components come the same way (`npx trayui add button tabs`). These are copies of the source rather than the package: change them as you like, and `npx trayui update` keeps your changes when a release changes the originals. [Add with a CLI](#d-cli) explains it, and the same items install with `npx shadcn add {{site}}/r/login-01.json`.

A block keeps the script of its HTML page, if it has one (a filter that narrows a table, a total that follows the quantities), as plain DOM code that runs once it is mounted: rewrite it with React state when you make the screen yours.

In Next.js, the components that keep state start with `'use client'`, in the package and in the copies, so a Server Component can render them as they are.

## What it does not have yet

The page layouts added for the blocks (the shell and sidebar variants, the screen frame) are in the stylesheet, so their classes work in React, but the components have no props for them yet: the React blocks write those classes as they are.
