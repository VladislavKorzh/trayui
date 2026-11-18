# trayui-react

[Tray UI](https://trayui.com) for React. The 108 components are typed React components over the system's own stylesheet and behaviours, so a page built in React looks the same as one written by hand. The charts are drawn with Recharts in the style of the system.

## Install

```sh
npm install trayui-react
```

It needs React 18 or later. `recharts` (for `trayui-react/charts`) and `react-icons` (for icons beyond the built-in ones) are optional peer dependencies.

## Use

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
- Variants are named after the modifiers of the classes (`variant="quiet"`, `size="sm"`).
- Components wire their own behaviour: use the component rather than `data-tray` attributes written by hand (for markup that must carry them, see [Markup written by hand](#markup-written-by-hand)).
- An `icon` prop takes a built-in name (`icon="truck"`) or any element from `react-icons/lu`.

## Server rendering and Next.js

Import the components straight into a Server Component: each file that needs the browser (state, effects, an event handler, a behaviour) starts with `'use client'`, so Next.js's App Router sends it to the browser and renders the rest on the server. The components that need nothing of the browser (Badge, Button, Card, Hero, Icon, Table, Typography and the like) render on the server with no script. Props a server passes must be data: text, numbers, elements, never a function.

```tsx
// app/layout.tsx
import 'trayui-react/styles.css';

// app/page.tsx, a Server Component
import { Button, Dialog, Tabs } from 'trayui-react';

export default function Page() {
  return <Tabs label="Order PL-20418" items={[{ value: 'items', label: 'Items', content: <p>Two jars</p> }, { value: 'delivery', label: 'Delivery', content: <p>Tomorrow</p> }]} />;
}
```

The page the server sends is the page React hydrates: on import the runtime only adds the icon sprite, and each component wires its own behaviour in an effect, once React has the markup. Server-rendered or not, StrictMode or not, nothing is wired twice.

## Markup written by hand

For markup that carries `data-tray` itself, such as a block pasted into a component, `useBehaviour` wires the behaviours under an element once it is mounted, and `useTrayEvent` hears their events. `runtime` holds the system's functions: `init`, `chart`, `calendar`, `toast` and `formatDate`.

```tsx
'use client';
import { useRef } from 'react';
import { useBehaviour, useTrayEvent } from 'trayui-react';

export function Pasted() {
  const ref = useRef<HTMLDivElement>(null);
  useTrayEvent(ref, 'change', (detail) => save(detail)); // before useBehaviour: a behaviour may report its first state at once
  useBehaviour(ref);
  return <div ref={ref}>{/* the block's markup, with its data-tray attributes */}</div>;
}
```

## Charts

```tsx
import { Chart } from 'trayui-react/charts';
```

`Chart` draws the six usual forms. `ChartContainer` and the parts around it frame a Recharts chart you compose yourself, with the system's title, colours, tooltip, key and table of figures. [`examples/charts`](examples/charts) holds 58 examples, one file each, to copy.

## Documentation

- [`docs/`](docs): the guide of each component, with its props and an example.
- [`previews/`](previews): one usage example per component.
- [The system's guides](../project/guides): grounds, accessibility and page layouts hold for React as well.

## Develop

```sh
npm run check            # type-check the package and the chart examples; check that a server can import every component and render every preview
npm run build            # compile to dist/
npm run try -- Button    # render a component's preview in Chrome and save a picture in .try/
```

`src/runtime.ts`, `src/icons.ts` and `styles/` are written by `python3 ../tools/build.py` from the plain-HTML system: edit `../src/` and rebuild, never these files.

## Licence

MIT, like the rest of Tray UI: see [LICENSE](../../LICENSE). The font (Onest, SIL Open Font License 1.1) and the icons (Lucide, ISC) travel with the package under their own licences, in `dist/fonts/OFL.txt` and `dist/LUCIDE-LICENSE.txt`.
