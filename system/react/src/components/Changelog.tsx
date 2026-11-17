import * as React from 'react';
import { cx } from '../lib/util';
import { Badge } from './Badge';

/**
 * The kind of change, as a tag: 'new' is the yellow "New" for the one thing to notice, 'improved' and 'fixed' are plain.
 * For another word, give `{ label: 'Security' }`; `accent: true` makes it yellow.
 */
export type ReleaseTag = 'new' | 'improved' | 'fixed' | { label: React.ReactNode; accent?: boolean };

/** One release: when it came out, what it is called, and what changed. */
export interface ChangelogRelease {
  /** The release date as an ISO date, "2026-11-12". It goes in the `datetime` of the `<time>`. */
  date: string;
  /** The date as it is shown. Default: the long form of `date`, "12 November 2026". */
  dateText?: React.ReactNode;
  /** The version, on a small badge under the date: "Version 3.4". */
  version?: React.ReactNode;
  /** The kinds of change, as tags over the title. Keep 'new' for the latest release: one yellow tag on a screen. */
  tags?: ReleaseTag[];
  /** What the person can do now, as a title: "Courier labels in one click". */
  title: React.ReactNode;
  /** One or two sentences under the title. */
  description?: React.ReactNode;
  /** The changes, one short line each, as a bullet list. */
  changes?: React.ReactNode[];
}

export interface ChangelogProps extends React.OlHTMLAttributes<HTMLOListElement> {
  /** The releases, newest first. */
  releases: ChangelogRelease[];
  /** The heading level of each release's title. Default 3. */
  headingLevel?: 2 | 3 | 4;
  /** The language of the dates written from `date`. Default 'en-GB'. */
  locale?: string;
}

const tagWords: Record<'new' | 'improved' | 'fixed', string> = { new: 'New', improved: 'Improved', fixed: 'Fixed' };

function longDate(iso: string, locale: string): string {
  const d = new Date(iso.length === 10 ? iso + 'T00:00:00Z' : iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);
}

/**
 * The changelog tells people what changed in the product: one entry per release, the date at the start edge, a title, a tag for the kind of change, and a short list.
 * Use it for a "What's new" page; inside the product, show the latest one or two in a Popover and link here.
 */
export const Changelog = React.forwardRef<HTMLOListElement, ChangelogProps>(function Changelog(
  { releases, headingLevel = 3, locale = 'en-GB', className, ...rest },
  ref,
) {
  const H = `h${headingLevel}` as 'h2' | 'h3' | 'h4';
  return (
    <ol ref={ref} className={cx('tray-changelog', className)} {...rest}>
      {releases.map((r, i) => (
        <li key={r.date + i} className="tray-release">
          <div className="tray-release__meta">
            <time dateTime={r.date}>{r.dateText ?? longDate(r.date, locale)}</time>
            {r.version != null ? <Badge>{r.version}</Badge> : null}
          </div>
          <div className="tray-release__body">
            {r.tags && r.tags.length ? (
              <div className="tray-release__tags">
                {r.tags.map((t, k) =>
                  typeof t === 'string' ? (
                    <Badge key={k} tone={t === 'new' ? 'accent' : 'neutral'}>
                      {tagWords[t]}
                    </Badge>
                  ) : (
                    <Badge key={k} tone={t.accent ? 'accent' : 'neutral'}>
                      {t.label}
                    </Badge>
                  ),
                )}
              </div>
            ) : null}
            <H className="subtitle">{r.title}</H>
            {r.description != null ? <p>{r.description}</p> : null}
            {r.changes && r.changes.length ? (
              <ul>
                {r.changes.map((c, k) => (
                  <li key={k}>{c}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
});
Changelog.displayName = 'Changelog';
