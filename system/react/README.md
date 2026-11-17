# trayui-react

[Tray UI](../../README.md) for React. The 108 components are typed React components over the system's own stylesheet and behaviours, so a page built in React looks the same as one written by hand. The charts are drawn with Recharts in the style of the system.

## Install

The package is not on npm yet. Build it from this folder:

```sh
python3 ../tools/build.py   # the system's stylesheet, behaviours and icons, which the package is built from
npm ci
npm run build                # dist/
```

Then add it to a project as a local package (`npm install ../path/to/system/react`). It needs React 18 or later. `recharts` (for `trayui-react/charts`) and `react-icons` (for icons beyond the built-in ones) are optional peer dependencies.

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
- Components wire their own behaviour, so never write `data-tray` attributes by hand in React: use the component.
- An `icon` prop takes a built-in name (`icon="truck"`) or any element from `react-icons/lu`.

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
npm run check            # type-check the package and the chart examples
npm run build            # compile to dist/
npm run try -- Button    # render a component's preview in Chrome and save a picture in .try/
```

`src/runtime.ts`, `src/icons.ts` and `styles/` are written by `python3 ../tools/build.py` from the plain-HTML system: edit `../src/` and rebuild, never these files.

## Licence

MIT, like the rest of Tray UI: see [LICENSE](../../LICENSE). The font (Onest, SIL Open Font License 1.1) and the icons (Lucide, ISC) travel with the package under their own licences, in `dist/fonts/OFL.txt` and `dist/LUCIDE-LICENSE.txt`.
