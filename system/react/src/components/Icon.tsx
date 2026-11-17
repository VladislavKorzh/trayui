import * as React from 'react';
import { icons } from '../icons';
import type { IconSource } from '../lib/icon';
import { cx } from '../lib/util';

export interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, 'name' | 'ref' | 'children' | 'dangerouslySetInnerHTML'> {
  /**
   * Which icon. A name is one of those built into the system, by Lucide's names: 'search', 'check', 'arrow-right', 'truck'.
   * Any other icon is an element: `name={<LuRocket />}`, from `react-icons/lu`.
   */
  name: IconSource;
  /** 'sm' is 16px, 'md' 20px (the default), 'lg' 28px. The stroke scales with the box: 2px at 20px. */
  size?: 'sm' | 'md' | 'lg';
  /** Mirrors the icon in right-to-left pages. Set it on arrows, chevrons and send, which point along the reading direction. */
  flip?: boolean;
  /** Names an icon that carries meaning on its own. Leave it out when words beside the icon say the same: the icon is then hidden from screen readers. */
  label?: string;
}

/**
 * An icon in the colour of the text around it. The system's icons are Lucide's: the ones built in go by name,
 * and every other one comes from `react-icons/lu` as an element. Both are drawn at the same size and with the same stroke.
 */
export const Icon = React.forwardRef<SVGSVGElement, IconProps>(function Icon({ name, size = 'md', flip, label, className, ...rest }, ref) {
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true as const };
  if (typeof name !== 'string') {
    /* An element from an icon library: it keeps its own drawing and takes the system's class, so its box and stroke match the built-in ones. */
    const own = (name.props as { className?: string }).className;
    return React.cloneElement(name as React.ReactElement<Record<string, unknown>>, {
      ...rest,
      ...a11y,
      focusable: 'false',
      className: cx('tray-icon', size === 'sm' && 'tray-icon--sm', size === 'lg' && 'tray-icon--lg', flip && 'tray-icon--flip', className, own),
    });
  }
  return (
    <svg
      ref={ref}
      className={cx('tray-icon', size === 'sm' && 'tray-icon--sm', size === 'lg' && 'tray-icon--lg', flip && 'tray-icon--flip', className)}
      viewBox="0 0 24 24"
      focusable="false"
      {...a11y}
      {...rest}
      dangerouslySetInnerHTML={{ __html: icons[name] }}
    />
  );
});
Icon.displayName = 'Icon';
