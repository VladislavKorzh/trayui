/*
 * trayui-react/static: render a React tree to a static HTML page that the plain-HTML system's bundle.js brings to life.
 * For a build step in Node (a site generator, a plain-HTML copy of a React page), not for an app: a Server Component must
 * not import it, and its output is never hydrated.
 */
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticMode } from './lib/static';

export interface StaticHTMLOptions {
  /** A prefix for the ids React's useId makes, when several trees are rendered into one page. */
  identifierPrefix?: string;
}

/**
 * Renders the tree to HTML in static mode: each component writes the markup of the plain-HTML system, `data-tray`
 * included, so the page works with `tokens.css`, `components/bundle.css` and `components/bundle.js` linked and no React.
 * What a component's state shows at first is what the page shows; after that bundle.js owns it, and it reports changes
 * as `tray:*` events, not through the component's callbacks. State a page keeps itself (a total that follows a choice)
 * is the page's own script's to keep.
 */
export function renderToStaticHTML(node: React.ReactNode, options?: StaticHTMLOptions): string {
  return renderToStaticMarkup(React.createElement(StaticMode.Provider, { value: true }, node), options);
}
