import { Changelog } from 'trayui-react';

export function Releases() {
  return (
    <div className="tray-stack">
      <Changelog
        releases={[
          {
            date: '2026-11-12',
            version: 'Version 3.4',
            tags: ['new'],
            title: 'Courier labels in one click',
            description: "Open an order and press Print: the label comes out with the courier's code on it.",
            changes: ['Works with both label sizes.', 'Reprints are counted, not charged.'],
          },
          {
            date: '2026-10-28',
            version: 'Version 3.3',
            tags: ['improved', 'fixed'],
            title: 'A faster orders page',
            changes: [
              'The list opens about twice as fast with more than 500 orders.',
              'Filters stay on when you come back from an order.',
              'Fixed: an export could miss orders placed in the last minute of a day.',
            ],
          },
        ]}
      />
      <p className="tray-demo-note">Versions and dates are invented for these examples.</p>
    </div>
  );
}

export function OtherTags() {
  return (
    <div className="tray-stack">
      <Changelog
        releases={[
          {
            date: '2026-09-30',
            version: 'Version 3.2',
            tags: [{ label: 'Security' }, 'improved'],
            title: 'Sign in with a code from your phone',
            description: 'Turn it on in Settings, under Account. People who pack keep signing in as before.',
          },
        ]}
      />
      <p className="tray-demo-note">Versions and dates are invented for these examples.</p>
    </div>
  );
}
