import * as React from 'react';
import { CookieConsent, type ConsentCategory } from 'trayui-react';

const kinds: ConsentCategory[] = [
  { name: 'necessary', label: 'Necessary', description: 'Signing in and the cart. Always on.', required: true },
  { name: 'statistics', label: 'Statistics', description: 'Which pages are opened, without your name.' },
];

export function ChooseWhich() {
  return (
    <div className="tray-stage tray-stage--end" style={{ placeItems: 'end start', minBlockSize: '24rem' }}>
      <CookieConsent
        description="We keep you signed in with one cookie. With your leave, two more tell us which pages help."
        categories={kinds}
        defaultExpanded
      />
    </div>
  );
}

/** The first visit, with the choices folded away. Answer it: the panel hides itself and onComplete receives the choice. */
export function FirstVisit() {
  const [choice, setChoice] = React.useState<Record<string, boolean> | null>(null);
  return (
    <div className="tray-stage tray-stage--end" style={{ placeItems: 'end start', minBlockSize: '18rem' }}>
      {choice ? (
        <p className="tray-soft">
          {'Saved: ' +
            Object.entries(choice)
              .map(([name, on]) => `${name} ${on ? 'on' : 'off'}`)
              .join(', ') +
            '.'}
        </p>
      ) : (
        <CookieConsent
          description="We keep you signed in with one cookie. With your leave, two more tell us which pages help."
          categories={kinds}
          onComplete={setChoice}
        />
      )}
    </div>
  );
}
