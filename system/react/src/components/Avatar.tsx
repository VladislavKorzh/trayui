import * as React from 'react';
import type { IconSource } from '../lib/icon';
import { cx } from '../lib/util';
import { Icon } from './Icon';

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** One or two initials, shown when there is no picture: "DK". */
  initials?: string;
  /** A photo. */
  src?: string;
  /** The photo's text alternative. Leave it empty when the person's name is written beside the avatar. */
  alt?: string;
  /** An icon in place of initials, such as 'user' for nobody yet, or 'sparkle' for an assistant. */
  icon?: IconSource;
  /** 'xs' 32px, 'sm' 40px, 'md' 48px (the default), 'lg' 64px. */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** 'tray' is the resting fill (the default). 'ink' marks the current person. 'accent' is for the product's own voice, once per view. */
  tone?: 'tray' | 'ink' | 'accent';
  /** The person's name, read by screen readers when no name is written beside the avatar. */
  label?: string;
}

/**
 * An avatar stands for a person or a team: a softly squared tile with a photo or initials.
 * Put the name next to it whenever there is room. Overlap several in a `<div className="tray-avatar-group" role="group" aria-label="Packing team, 6 people">`.
 */
export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { initials, src, alt = '', icon, size = 'md', tone = 'tray', label, className, children, ...rest },
  ref,
) {
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true as const };
  return (
    <span ref={ref} className={cx('tray-avatar', size !== 'md' && `tray-avatar--${size}`, tone !== 'tray' && `tray-avatar--${tone}`, className)} {...a11y} {...rest}>
      {src ? <img src={src} alt={alt} /> : icon ? <Icon name={icon} /> : initials ?? children}
    </span>
  );
});
Avatar.displayName = 'Avatar';
