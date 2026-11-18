'use client';
import * as React from 'react';
import { cx, useUid } from '../lib/util';
import { Card } from './Card';
import { InputGroup } from './InputGroup';

/** The email form that takes the place of the buttons, for a newsletter or a waiting list. */
export interface CallToActionEmail {
  /** The words of the button inside the field: "Subscribe". */
  action: string;
  /** The field's label, kept for screen readers and hidden from view: the card has no room for it. Default "Email". */
  label?: string;
  /** An example address: "you@farm.example". */
  placeholder?: string;
  /** Called with the address when the form is sent. The browser checks first that it looks like an email. */
  onSubmit?: (email: string) => void;
}

export interface CallToActionProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title' | 'onSubmit'> {
  /** The offer, as a statement: "Pack tomorrow's orders with Counter". Never a question. */
  title: React.ReactNode;
  /** 'headline' (the default) for the closing offer; 'title' for a smaller one, such as a newsletter. */
  titleSize?: 'headline' | 'title';
  /** One line under the title that removes a doubt: "Free for 14 days. Your products and customers stay yours." */
  description?: React.ReactNode;
  /** The buttons at the end edge. On the yellow card: `<Button variant="dark">Start free</Button>` and a quiet second one. */
  actions?: React.ReactNode;
  /** An email form in place of the buttons: a field with its button inside. It takes the place of `actions`. */
  email?: CallToActionEmail;
  /** 'accent' is the yellow card, the only one on its screen (the default with `actions`). 'tray' is the grey card (the default with `email`, whose button is the yellow). */
  tone?: 'accent' | 'tray';
  /** The heading level of the title. Default 2. */
  headingLevel?: 2 | 3;
}

/**
 * The call to action closes a page: one yellow card with the offer in a headline and the button that takes it.
 * The text sits at the start edge and the buttons at the end edge; when there is no room the buttons drop under the text.
 */
export const CallToAction = React.forwardRef<HTMLElement, CallToActionProps>(function CallToAction(
  { title, titleSize = 'headline', description, actions, email, tone, headingLevel = 2, className, ...rest },
  ref,
) {
  const H = `h${headingLevel}` as 'h2' | 'h3';
  const emailId = useUid('cta-email');
  const cardTone = tone ?? (email ? 'tray' : 'accent');
  const send = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem('email') as HTMLInputElement | null;
    email?.onSubmit?.(input?.value ?? '');
  };
  return (
    <Card ref={ref} as="section" tone={cardTone} className={cx('tray-cta', className)} {...rest}>
      <div className="tray-cta__text">
        <H className={titleSize}>{title}</H>
        {description != null ? <p>{description}</p> : null}
      </div>
      {email ? (
        // the field's width, as the original form sets it
        <form style={{ flex: '1 1 20rem', maxInlineSize: '26rem' }} onSubmit={send}>
          {/* a real label, visually hidden: the field sits in one row with the title, with no room above it */}
          <label className="tray-vh" htmlFor={emailId}>
            {email.label ?? 'Email'}
          </label>
          <InputGroup
            id={emailId}
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder={email.placeholder}
            action={{ label: email.action, accent: true, type: 'submit' }}
          />
        </form>
      ) : actions != null ? (
        <div className="tray-cta__actions">{actions}</div>
      ) : null}
    </Card>
  );
});
CallToAction.displayName = 'CallToAction';
