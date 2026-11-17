import { Avatar } from 'trayui-react';

export function Sizes() {
  return (
    <div className="tray-row">
      <Avatar size="xs" initials="DK" />
      <Avatar size="sm" initials="AM" />
      <Avatar initials="BS" />
      <Avatar size="lg" initials="OF" />
    </div>
  );
}

export function Tones() {
  return (
    <div className="tray-row">
      <Avatar tone="ink" initials="DK" label="Dana Kovalenko, you" />
      <Avatar tone="accent" icon="sparkle" label="Assistant" />
      <Avatar icon="user" label="Nobody assigned" />
    </div>
  );
}

export function GroupAndName() {
  return (
    <div className="tray-row" style={{ gap: 32 }}>
      <div className="tray-avatar-group">
        <Avatar initials="AM" />
        <Avatar initials="BS" />
        <Avatar initials="OF" />
        <Avatar tone="ink" initials="+3" />
      </div>
      <div className="tray-row tray-row--sm">
        <Avatar initials="OF" />
        <div><p className="label" style={{ fontWeight: 600 }}>Oksana Franko</p><p className="caption tray-muted">Farm manager</p></div>
      </div>
    </div>
  );
}
