'use client';
import * as React from 'react';
import { cx, useTrayEvent, useBehaviour, useForwardedRef, useUid } from '../lib/util';
import { Button } from './Button';
import { Collapsible } from './Collapsible';
import { Switch } from './Switch';

/** One kind of cookie the person can allow or refuse. */
export interface ConsentCategory {
  /** The key it has in the reported choice: "statistics". */
  name: string;
  /** Its name, one or two words: "Statistics". */
  label: React.ReactNode;
  /** What it is for, in one line: "Which pages are opened, without your name." */
  description?: React.ReactNode;
  /** Always on and cannot be turned off, for the cookies the site needs to work. Default false. */
  required?: boolean;
  /** Starts switched on. Default false: nothing optional is on before the person says so. */
  defaultOn?: boolean;
}

export interface CookieConsentProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** The panel's title. Default "Cookies". */
  title?: React.ReactNode;
  /** What is stored and why, in one or two plain sentences: "We keep you signed in with one cookie. With your leave, two more tell us which pages help." */
  description: React.ReactNode;
  /** The kinds of cookie, listed with a switch each under "Choose which". Leave it out when there is nothing to choose. */
  categories?: ConsentCategory[];
  /** The trigger that shows the categories. Default "Choose which". */
  chooseLabel?: React.ReactNode;
  /** Whether the categories start shown. Default false. */
  defaultExpanded?: boolean;
  /** Pins the panel to the bottom start corner, over the page, for the first visit. Without it the panel sits in the flow, for a settings page. */
  fixed?: boolean;
  /** The button that turns every optional kind off. Default "Only necessary". */
  necessaryLabel?: React.ReactNode;
  /** The button that turns every kind on. Default "Accept all". */
  acceptLabel?: React.ReactNode;
  /** The link that keeps the switches as they are set; shown only with `categories`. Default "Save my choice". */
  saveLabel?: React.ReactNode;
  /**
   * Called once the person answers, with each category's `name` and whether it is on. The panel hides itself then.
   * Store the choice and load nothing optional before it.
   */
  onComplete?: (choice: Record<string, boolean>) => void;
}

/**
 * Cookie consent is a raised panel in the corner of the first visit: what is stored and why, and three equal ways to answer.
 * "Only necessary" and "Accept all" carry the same weight, and nothing on it is yellow: consent is not something to steer.
 */
export const CookieConsent = React.forwardRef<HTMLElement, CookieConsentProps>(function CookieConsent(
  {
    title = 'Cookies',
    description,
    categories,
    chooseLabel = 'Choose which',
    defaultExpanded = false,
    fixed,
    necessaryLabel = 'Only necessary',
    acceptLabel = 'Accept all',
    saveLabel = 'Save my choice',
    onComplete,
    className,
    ...rest
  },
  forwarded,
) {
  const ref = useForwardedRef<HTMLElement>(forwarded);
  const titleId = useUid('consent');
  useTrayEvent(ref, 'complete', (detail: { choice: Record<string, boolean> }) => onComplete?.(detail.choice), { own: true });
  useBehaviour(ref);

  const choose = categories && categories.length > 0;
  return (
    <section
      ref={ref}
      className={cx('tray-consent', fixed && 'tray-consent--fixed', 'tray-raised', className)}
      data-tray="consent"
      aria-labelledby={titleId}
      {...rest}
    >
      <h2 className="nav" id={titleId}>
        {title}
      </h2>
      <p className="tray-consent__text">{description}</p>
      {choose ? (
        <Collapsible summary={chooseLabel} defaultOpen={defaultExpanded}>
          <div className="tray-stack tray-stack--sm">
            {categories.map((c) => (
              // the consent behaviour sets and reads these boxes itself: they stay uncontrolled
              <Switch
                key={c.name}
                layout="row"
                name={c.name}
                label={c.label}
                description={c.description}
                defaultChecked={c.required || c.defaultOn}
                disabled={c.required}
              />
            ))}
          </div>
        </Collapsible>
      ) : null}
      <div className="tray-consent__actions">
        <Button variant="quiet" size="sm" data-consent="necessary">
          {necessaryLabel}
        </Button>
        <Button variant="quiet" size="sm" data-consent="all">
          {acceptLabel}
        </Button>
        {choose ? (
          <Button variant="link" data-consent="save">
            {saveLabel}
          </Button>
        ) : null}
      </div>
    </section>
  );
});
CookieConsent.displayName = 'CookieConsent';
