# Why an npm ES module breaks in Node

Node and webpack refuse a relative import with no file extension, and esbuild does not: the rule, how to reproduce it, and a build step that fixes the package.

An ES module package can work in every project its author tries and still fail the first time someone imports it in Node or bundles it with webpack. The cause is usually one kind of line, repeated across the package: a relative import that does not name its file, such as `export * from './button'`. Tray UI's React package, `trayui-react`, shipped that way in version 0.2.0. Version 0.2.1 fixed it with one step at the end of its build. Every result below comes from a scratch project run on Node 24, webpack 5.112, esbuild 0.28 and TypeScript 5.9.

## The two errors

The examples use a small package called `shelf`, written out in full further down. Node stops at its first import:

```text
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/app/node_modules/shelf/dist/button' imported from /app/node_modules/shelf/dist/index.js
```

webpack reports the same line, and says more about why:

```text
ERROR in ./node_modules/shelf/dist/index.js 1:0-25
Module not found: Error: Can't resolve './button' in '/app/node_modules/shelf/dist'
Did you mean 'button.js'?
BREAKING CHANGE: The request './button' failed to resolve only because it was resolved as fully specified
(probably because the origin is strict EcmaScript Module, e. g. a module with javascript mimetype, a '*.mjs' file, or a '*.js' file where the package.json contains '"type": "module"').
The extension in the request is mandatory for it to be fully specified.
Add the extension to the request.
```

The paths are shortened to `/app`. Both programs find the file once the import names it.

## The rule in Node

Node's documentation for ES modules has a section called "Mandatory file extensions": "A file extension must be provided when using the `import` keyword to resolve relative or absolute specifiers. Directory indexes (e.g. `'./startup/index.js'`) must also be fully specified." It adds that this "matches how `import` behaves in browser environments, assuming a typically configured server". A browser asks the server for the address it was given, and `/dist/button` is a different address from `/dist/button.js`.

CommonJS works differently. Node's page on packages says that `require()` "will try to add extensions (`.js`, `.json`, and finally `.node`) and then attempt to resolve folders as modules", while `import` "does not perform extension searching". A folder fails with a code of its own: with `./button` fixed, `export * from './forms'` stops Node with `ERR_UNSUPPORTED_DIR_IMPORT`.

## The rule in webpack

webpack 5 applies the same rule to the same files. Its option `resolve.fullySpecified` is on for `.mjs` files and for `.js` files "when their nearest parent `package.json` file contains a `"type"` field with a value of `"module"`". An import without its extension then fails "with a `Module not found` error. And webpack won't resolve directories with filenames defined in the `resolve.mainFiles`". The field that tells Node a package is made of ES modules is the field that turns the check on.

An application can turn the check off for every module it bundles:

```js
// webpack.config.js in the application
module.exports = {
  module: {
    rules: [{ test: /\.m?js$/, resolve: { fullySpecified: false } }],
  },
};
```

With that rule, webpack compiled `shelf`. Every project that installs the package would need the same rule, though, and a program that Node runs would still stop at the first import. The fix belongs in the package.

## Why the author's bundler said nothing

esbuild bundled `shelf` without a warning, and its bundle printed the right words. It also bundled `trayui-react` 0.2.0, and that bundle rendered a button. The TypeScript 5.0 release notes describe why: "Most modern bundlers use a fusion of the ECMAScript module and CommonJS lookup rules in Node.js", and an import without an extension is one of the CommonJS habits they keep.

TypeScript can hide the problem too. Its `"moduleResolution": "bundler"` accepts `export * from "./utils"` in a source file, and with `"module": "esnext"` the output "will look exactly the same as the input". The TypeScript handbook goes on: "If that JavaScript were published to npm, it would be usable by projects that use a bundler, but it would cause an error when run in Node.js", and calls the bundler setting "infectious, allowing code that only works in bundlers to be produced". Tray UI's React package compiles with `"module": "ESNext"` and `"moduleResolution": "Bundler"`, and the index its build generates has one line per component, such as `export * from './components/Button';`.

## Reproduce it

Make the package by hand inside `node_modules`, so no registry is involved:

```json
{
  "name": "shelf",
  "version": "1.0.0",
  "type": "module",
  "exports": "./dist/index.js"
}
```

```js
// node_modules/shelf/dist/index.js
export * from './button';
export * from './forms';

// node_modules/shelf/dist/button.js
export const label = 'Order a jar';

// node_modules/shelf/dist/forms/index.js
export const field = 'Email';
```

Then an application that uses it, in a project whose own `package.json` has `"type": "module"`:

```js
// app.js
import { label, field } from 'shelf';
console.log(label, field);
```

```sh
node app.js
npx webpack --mode production --entry ./app.js
npx esbuild app.js --bundle --platform=node --format=esm --outfile=out/app.js
```

| Tool | Before the fix | After the fix |
| --- | --- | --- |
| Node 24 | `ERR_MODULE_NOT_FOUND` for `./button`, then `ERR_UNSUPPORTED_DIR_IMPORT` for `./forms` | Prints `Order a jar Email` |
| webpack 5.112 | `Module not found` for both imports | Compiles |
| esbuild 0.28 | Bundles, and the bundle prints both words | Bundles, and the bundle prints both words |

## Ways to fix it

1. **Name the file in the source.** TypeScript lets a `.ts` file import `./utils.js`, and finds `utils.ts` for it. The handbook says that writing `export * from "./utils.js"` "would produce output that works both in Node.js and in bundlers", and advises `"module": "node18"` or `nodenext` for a library, because those settings make the compiler insist on it.
2. **Name the file after the compile.** Leave the source as it is, and rewrite the imports in the output. One function, run over `dist/`, does it.

A third route is to bundle the library into one file before it is published; the handbook allows the bundler setting in that case. Tray UI took the second way, which left its source files and its compiler settings as they were.

## The build step

This script is Tray UI's function with a name and a command line of its own. Run it after the compiler, on the folder it wrote:

```js
// node fix-imports.mjs dist: name the file in every relative import of the .js and .d.ts files in dist
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const IMPORT = /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(['"])(\.{1,2}\/[^'"]+?)\2/g;

function fix(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) { fix(path); continue; }
    if (!/\.(js|d\.ts)$/.test(entry.name)) continue;
    const text = readFileSync(path, 'utf8');
    const out = text.replace(IMPORT, (whole, lead, q, spec) => {
      if (/\.(m?js|json|css)$/.test(spec)) return whole;        // already named
      const at = join(dirname(path), spec);
      if (existsSync(at + '.js')) return lead + q + spec + '.js' + q;                    // a file
      if (existsSync(join(at, 'index.js'))) return lead + q + spec + '/index.js' + q;  // a folder
      return whole;
    });
    if (out !== text) writeFileSync(path, out);
  }
}

fix(process.argv[2] ?? 'dist');
```

- **Three forms.** The pattern finds `from '…'`, which covers `import` and `export` lines, a dynamic `import('…')`, and a bare `import '…'` that loads a file for its side effects.
- **Relative paths only.** A specifier must start with `./` or `../`. Package names such as `'react'` are left alone; Node looks those up in `node_modules`.
- **The disk decides.** `./button` becomes `./button.js` when that file exists, and `./forms` becomes `./forms/index.js` when that folder holds one. An import that matches neither stays as it was, for the error to report.
- **The declaration files too.** In a `.d.ts` file, TypeScript reads `./button.js` as the `button.d.ts` beside it.

A regular expression matches text without parsing it, so an import written inside a comment or a string is rewritten as well, when its file exists. Read the diff of `dist/` the first time the script runs.

## The types break the same way

A TypeScript project set to `nodenext` reads a package's declaration files by Node's rules, so an extensionless `export *` in `index.d.ts` leads nowhere. This file checks the package as such a project sees it:

```json
{
  "compilerOptions": {
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true
  },
  "files": ["check.tsx"]
}
```

```tsx
// check.tsx
import { Button } from 'trayui-react';
export const order = <Button>Order a jar</Button>;
```

With 0.2.0, `npx tsc` reports `error TS2305: Module '"trayui-react"' has no exported member 'Button'.` With 0.2.1 it reports nothing.

## Check the package as its users will

A bundler in the author's own project is the wrong test. Pack the package, install the archive in an empty project, and import it with Node:

```sh
npm pack                                   # writes shelf-1.0.0.tgz
cd "$(mktemp -d)" && npm init -y > /dev/null
npm install /path/to/shelf-1.0.0.tgz
node --input-type=module -e "await import('shelf')"
```

The last command exits with code 1 while an import cannot be resolved, and with 0 once every import names its file, so it can run in continuous integration before `npm publish`. Run webpack on a one-line entry in the same folder to cover the second resolver.

## trayui-react 0.2.1

The changelog of 0.2.1 reads: "The package's imports name their files (`./components/Button.js`), so it loads in Node and in webpack and Next.js, which follow the standard for ES modules; 0.2.0 loaded only where the bundler guessed the extension." The function above now runs in `scripts/build.mjs`, after `tsc` and before the stylesheet and the font are copied into `dist/`.

The two packages on npm differ in little else. Each has 126 JavaScript files with 437 relative imports between them: in 0.2.0 none names its file, in 0.2.1 each one does. The rest of the difference is the version number and the README, which now says to install the package from npm. The same three checks as above give:

| Check | 0.2.0 | 0.2.1 |
| --- | --- | --- |
| Node imports the package | `Cannot find module '…/trayui-react/dist/components/Accordion'` | Loads; `renderToStaticMarkup` gives `<button type="button" class="tray-btn">Order a jar</button>` |
| webpack bundles `{ Button }` | 108 `Module not found` errors, one per component | Compiles |
| `tsc` with `nodenext` | `TS2305` for `Button` | No errors |

The package is an ES module with an `exports` map, so `import { Button } from 'trayui-react'` and `import { ChartContainer } from 'trayui-react/charts'` are its two entry points, and `trayui-react/styles.css` is its stylesheet:

```sh
npm install trayui-react
```

[React](#d-react) has the components, the charts and the stylesheet, and [Installation](#d-installation) covers the plain HTML version, which needs no package at all.
