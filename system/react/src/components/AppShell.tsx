'use client';
import * as React from 'react';
import { cx, useControlled, useUid } from '../lib/util';
import { ShellContext, type ShellState } from '../lib/shell';
import { Sheet } from './Sheet';
import { Sidebar, type SidebarProps } from './Sidebar';

/** The sidebar of an AppShell: every Sidebar prop but the collapse, which the shell holds. */
export type AppShellSidebar = Omit<SidebarProps, 'collapsed' | 'defaultCollapsed' | 'onCollapsedChange'>;

export interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The sidebar, as Sidebar props: `groups` of items, `head` (a WorkspaceSwitcher, with `flushHead`), `foot` (a usage meter), `user`,
   * and the current item with `value`/`defaultValue`/`onChange`. Leave `collapsible` out when the TopBar has the collapse button.
   */
  sidebar: AppShellSidebar;
  /** The row above the content: a `<TopBar>`. Inside the shell it gets a button at its start that collapses the sidebar. */
  topbar?: React.ReactNode;
  /** The page, in one centred column at most 72rem wide with 32px between sections: a PageHeader first, then the content. Give it no card of its own. */
  children?: React.ReactNode;
  /** Whether the sidebar is collapsed to a rail of icons. Control it with `onCollapsedChange`; leave it out and the shell keeps its own state. */
  collapsed?: boolean;
  /** Whether the sidebar starts collapsed, when `collapsed` is left out. Default false. */
  defaultCollapsed?: boolean;
  /** Called with the new state when the top bar's button (or the sidebar's own) collapses or expands the sidebar. */
  onCollapsedChange?: (collapsed: boolean) => void;
  /**
   * The contained form: a fixed height (`height`), rounded corners, and the content scrolls inside it.
   * For an embedded tool or a preview, never for the product page itself, which fills the window.
   */
  contained?: boolean;
  /** With `contained`: the shell's height, such as '46rem'. Default '40rem'. */
  height?: string;
  /** The title of the Sheet that holds the navigation on a phone, where the sidebar is hidden. Default 'Menu'. */
  menuTitle?: string;
}

/**
 * The app shell is the frame of a product: the sidebar on a tray at the start edge, the top bar over the content, and one centred column for the page.
 * Use it once, as the outermost element of an application; on a phone the sidebar leaves the page and opens in a Sheet from a button in the top bar.
 */
export const AppShell = React.forwardRef<HTMLDivElement, AppShellProps>(function AppShell(
  { sidebar, topbar, children, collapsed, defaultCollapsed = false, onCollapsedChange, contained, height, menuTitle = 'Menu', className, style, ...rest },
  ref,
) {
  const auto = useUid('app-sidebar');
  const sidebarId = sidebar.id ?? auto;
  const [rail, setRail] = useControlled(collapsed, defaultCollapsed, onCollapsedChange);
  // One current item for the sidebar and its copy in the phone's sheet.
  const [current, setCurrent] = useControlled<string | undefined>(sidebar.value, sidebar.defaultValue, sidebar.onChange as ((v: string | undefined) => void) | undefined);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [menuMounted, setMenuMounted] = React.useState(false);

  const shell = React.useMemo<ShellState>(
    () => ({
      sidebarId,
      collapsed: rail,
      setCollapsed: setRail,
      openMenu: () => {
        setMenuMounted(true);
        setMenuOpen(true);
      },
      menuOpen,
    }),
    [sidebarId, rail, setRail, menuOpen],
  );

  const { value: _value, defaultValue: _defaultValue, onChange: _onChange, id: _id, ...nav } = sidebar;
  const appStyle = contained && height ? ({ '--tray-app-height': height, ...style } as React.CSSProperties) : style;

  return (
    <ShellContext.Provider value={shell}>
      <div ref={ref} className={cx('tray-app', contained && 'tray-app--contained', className)} style={appStyle} {...rest}>
        <div className="tray-app__side">
          <Sidebar {...nav} id={sidebarId} value={current} onChange={setCurrent} collapsed={rail} onCollapsedChange={setRail} />
        </div>
        <div className="tray-app__main">
          {topbar}
          <main className="tray-app__content">{children}</main>
        </div>
        {menuMounted ? (
          <Sheet side="start" title={menuTitle} open={menuOpen} onOpenChange={setMenuOpen}>
            <Sidebar
              {...nav}
              id={sidebarId + '-sheet'}
              collapsible={false}
              value={current}
              onChange={(v) => {
                setCurrent(v);
                setMenuOpen(false);
              }}
            />
          </Sheet>
        ) : null}
      </div>
    </ShellContext.Provider>
  );
});
AppShell.displayName = 'AppShell';
