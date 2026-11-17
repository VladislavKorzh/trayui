import * as React from 'react';
import { cx, useControlled } from '../lib/util';
import { initialsOf, usePopAnchor } from '../lib/shell';
import { Avatar } from './Avatar';
import { Icon } from './Icon';

export interface Workspace {
  /** Names the workspace for `value`, `defaultValue` and `onChange`. */
  value: string;
  /** The workspace's name: "Perly Farm". */
  name: string;
  /** The second line on the button: the plan ("Shop plan"), or the person's role there ("You are a packer here"). */
  detail?: React.ReactNode;
  /** One or two initials on its tile: "PF". Default: from the name. */
  initials?: string;
  /** A logo for its tile, in place of the initials. */
  src?: string;
}

export interface WorkspaceSwitcherProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Every workspace the person can open, the current one among them. */
  workspaces: Workspace[];
  /** The current workspace, by `value`. Leave it out to let the switcher keep its own. */
  value?: string;
  /** The workspace current at first, when `value` is left out. Default: the first. */
  defaultValue?: string;
  /** Called with the chosen workspace's `value`; the menu closes. Open that workspace here. */
  onChange?: (value: string) => void;
  /** The last item, after a rule, that starts a new workspace. Default 'New workspace'; false leaves it out. */
  createLabel?: string | false;
  /** Called when "New workspace" is chosen. */
  onCreate?: () => void;
  /** The small heading over the list. Default 'Workspaces'. */
  label?: string;
  /** Opens or closes the list from outside. The button, a click outside and Escape still work and report through `onOpenChange`. */
  open?: boolean;
  /** Whether the list starts open: also holds it open in a static picture, until a click outside. Default false. */
  defaultOpen?: boolean;
  /** Called with `true` when the list opens and `false` when it closes. */
  onOpenChange?: (open: boolean) => void;
}

/**
 * The workspace switcher is the button at the top of the sidebar that says which workspace you are in and opens the list of the others.
 * Put it in the Sidebar's `head` with `flushHead`; account actions (profile, sign out) belong to the UserMenu, not here.
 */
export const WorkspaceSwitcher = React.forwardRef<HTMLDivElement, WorkspaceSwitcherProps>(function WorkspaceSwitcher(
  {
    workspaces,
    value,
    defaultValue,
    onChange,
    createLabel = 'New workspace',
    onCreate,
    label = 'Workspaces',
    open,
    defaultOpen,
    onOpenChange,
    className,
    ...rest
  },
  forwarded,
) {
  const [current, setCurrent] = useControlled(value, defaultValue ?? workspaces[0]?.value ?? '', onChange);
  const { ref, setRef, initiallyOpen, handle } = usePopAnchor<HTMLDivElement>('menu', forwarded, { open, defaultOpen, onOpenChange });
  const here = workspaces.find((w) => w.value === current) ?? workspaces[0];

  const choose = (w: Workspace) => {
    // The behaviour has moved the check already: put back the one React holds, and let the new choice arrive through state.
    ref.current?.querySelectorAll('[role="menuitemradio"]').forEach((el) => el.setAttribute('aria-checked', String(el.getAttribute('data-value') === current)));
    setCurrent(w.value);
    handle()?.close(true);
  };

  const accessibleName = here ? here.name + (typeof here.detail === 'string' ? ', ' + here.detail : '') : undefined;

  return (
    <div ref={setRef} className={cx('tray-anchor tray-anchor--block', className)} data-tray="menu" {...rest}>
      <button className="tray-switcher" type="button" aria-haspopup="menu" aria-label={accessibleName}>
        <Avatar size="sm" tone="ink" initials={here ? here.initials ?? initialsOf(here.name) : undefined} src={here?.src} />
        <span className="tray-person__text">
          <b>{here?.name}</b>
          {here?.detail != null ? <small>{here.detail}</small> : null}
        </span>
        <Icon name="chevrons-up-down" />
      </button>
      <div className="tray-pop" role="menu" data-open={initiallyOpen ? '' : undefined} hidden={initiallyOpen ? undefined : true}>
        <div className="tray-list">
          {label ? <p className="tray-list__label">{label}</p> : null}
          {workspaces.map((w) => {
            const on = w.value === current;
            return (
              <button
                key={w.value}
                type="button"
                className="tray-option"
                role="menuitemradio"
                data-group="workspace"
                data-value={w.value}
                aria-checked={on}
                tabIndex={-1}
                onClick={() => choose(w)}
              >
                <Avatar size="xs" tone={on ? 'ink' : 'tray'} initials={w.initials ?? initialsOf(w.name)} src={w.src} />
                <span className="tray-option__text">{w.name}</span>
                <Icon name="check" className="tray-option__check" />
              </button>
            );
          })}
          {createLabel !== false ? (
            <>
              <hr className="tray-list__rule" />
              <button type="button" className="tray-option" role="menuitem" data-value="new-workspace" tabIndex={-1} onClick={() => onCreate?.()}>
                <Icon name="plus" />
                <span className="tray-option__text">{createLabel}</span>
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
});
WorkspaceSwitcher.displayName = 'WorkspaceSwitcher';
