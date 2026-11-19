import * as React from 'react';

/*
 * Static mode: the components write the plain-HTML system's markup, with the `data-tray` attributes bundle.js wires, in
 * place of the behaviour React would otherwise give them. It is on only inside renderToStaticHTML() (the entry
 * 'trayui-react/static'), which renders with react-dom/server's renderToStaticMarkup: HTML that React never hydrates and
 * whose effects and event handlers never run, so a page made of it has one owner, bundle.js. Off, the default, every
 * component renders exactly what it renders without this file. Never provide it in a live tree: React's handlers and
 * bundle.js would both answer the same press.
 */
export const StaticMode = React.createContext(false);

/** True while the tree is rendered by renderToStaticHTML(): write the HTML system's markup for bundle.js. */
export function useStaticMode(): boolean {
  return React.useContext(StaticMode);
}

/**
 * The words of the chip each check item of a menu becomes in a Filter Bar, by the item's value, which the menu's items
 * write as data-label for bundle.js's filterbar behaviour. Filter Bar provides it in static mode only.
 */
export const StaticChipLabels = React.createContext<ReadonlyMap<string, string> | null>(null);
