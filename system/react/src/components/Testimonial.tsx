import * as React from 'react';
import { cx } from '../lib/util';
import { Avatar } from './Avatar';
import { Card } from './Card';

export interface TestimonialProps extends React.HTMLAttributes<HTMLElement> {
  /** The customer's own sentence, cut to its one strong line, without quotation marks: the card adds them. */
  quote: React.ReactNode;
  /** Who said it: "Oksana Franko". */
  name: string;
  /** Their business and where it is, in muted type: "Perly Farm, Kyiv region". */
  detail?: React.ReactNode;
  /** Their photograph, with their leave. Never a stock portrait. */
  photo?: string;
  /** The initials shown when there is no photograph. Default: the first letters of the first two words of `name`. */
  initials?: string;
  /** 'md' (the default) sets the quote in `subtitle` size; 'sm' sets it in body size, for a row of three. */
  size?: 'md' | 'sm';
  /** 'tray' (the default), or 'inverse' for the one testimonial on a page that sits on an ink card. */
  tone?: 'tray' | 'inverse';
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}

/**
 * A testimonial is a customer's own sentence about the product, set large, with who said it underneath.
 * Quote only real people, with their name, their business and their leave; never write the quote yourself.
 */
export const Testimonial = React.forwardRef<HTMLElement, TestimonialProps>(function Testimonial(
  { quote, name, detail, photo, initials, size = 'md', tone = 'tray', className, ...rest },
  ref,
) {
  return (
    <Card ref={ref} as="figure" tone={tone} className={cx('tray-testimonial', size === 'sm' && 'tray-testimonial--sm', className)} {...rest}>
      <blockquote>
        {'“'}
        {quote}
        {'”'}
      </blockquote>
      <figcaption className="tray-person">
        <Avatar src={photo} initials={initials ?? initialsOf(name)} />
        <span className="tray-person__text">
          <b>{name}</b>
          {detail != null ? <small>{detail}</small> : null}
        </span>
      </figcaption>
    </Card>
  );
});
Testimonial.displayName = 'Testimonial';
