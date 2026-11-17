// Helpers shared by the account components: TeamMembers, ApiKeys, InviteForm, TagInput, FileUpload. Not exported from the package.
import * as React from 'react';

/** The same test the taginput behaviour applies with data-pattern="email". */
export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** True when a value would be a danger chip under the given pattern. */
export function wrongFor(pattern: 'email' | undefined, value: string): boolean {
  return pattern === 'email' && !EMAIL.test(value);
}

/** A file size in words, the way the dropzone behaviour writes it: "84 KB", "1.4 MB". */
export function fileSize(bytes: number): string {
  return bytes < 1048576 ? Math.max(1, Math.round(bytes / 1024)) + ' KB' : (bytes / 1048576).toFixed(1) + ' MB';
}

/**
 * The head above a table or a form on an account page, as the HTML previews draw it: a subtitle and a line of soft text at the start,
 * one button at the end. The line is 1rem, as in the originals (they set it inline).
 */
export function SectionHead({
  title,
  description,
  action,
  headingLevel = 2,
  id,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  headingLevel?: 2 | 3 | 4;
  id?: string;
}) {
  if (title == null && description == null && action == null) return null;
  const H = `h${headingLevel}` as 'h2' | 'h3' | 'h4';
  const text =
    title != null || description != null ? (
      <div>
        {title != null ? (
          <H className="subtitle" id={id}>
            {title}
          </H>
        ) : null}
        {description != null ? (
          <p className="tray-soft" style={{ fontSize: '1rem' }}>
            {description}
          </p>
        ) : null}
      </div>
    ) : null;
  if (action == null) return text;
  return (
    <div className="tray-row tray-row--between">
      {text ?? <span />}
      {action}
    </div>
  );
}
