'use client';
import * as React from 'react';
import { cx, useBehaviour, useForwardedRef, useUid } from '../lib/util';
import { Icon } from './Icon';

export interface CodeBlockProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'dir'> {
  /** The code, as plain text with its line breaks. You can also pass it as the children, in a template string. One leading and one trailing line break are dropped. */
  code?: string;
  /** The file name or the language, on the left of the header: "stock.js". With it the header shows, and the Copy button with it. */
  title?: React.ReactNode;
  /** A Copy button in the header that copies the code and reads "Copied" for two seconds. Needs a `title`. Default true. */
  copy?: boolean;
  /** Numbers the lines in the margin. Default false. */
  numbered?: boolean;
  /** Highlights a line, or several: the 1-based line numbers. */
  mark?: number | number[];
  /** 'md' (the default), or 'sm', the compact size for output inside a Trace. */
  size?: 'md' | 'sm';
  /**
   * Colours the code with the system's syntax colours (GitHub's): comments, strings, keywords, literals, numbers and the
   * names of functions, found by a small tokenizer for JavaScript-like code. Turn it off for terminal output and plain
   * text. For HTML, CSS or JSX, colour the code with highlight.js and pass its output as the children. Default true.
   */
  highlight?: boolean;
  /**
   * The code as a string, or code you have coloured yourself: any element holding highlight.js's output (`hljs-` classes),
   * or your own `<span className="tray-code__line">` lines.
   */
  children?: React.ReactNode;
}

const KEYWORDS = new Set(
  (
    'function return const let var if else for while switch case break continue new class extends import export default async await ' +
    'try catch finally throw typeof instanceof this void yield static interface enum implements of in from as type ' +
    'def elif lambda pass raise except func package struct fn pub impl mut'
  ).split(' '),
);
const LITERALS = new Set('true false null undefined None True False nil'.split(' '));
/* A comment, a string, a number, or a name. */
const TOKEN =
  /(\/\/.*$|\/\*.*?\*\/|(?:^|(?<=\s))#(?:\s.*)?$)|('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`)|\b(\d[\d_]*(?:\.\d+)?)\b|\b([A-Za-z_]\w*)\b/g;

/** Splits one line into plain text and spans with highlight.js's classes, which the code block colours. */
function tokens(line: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let last = 0;
  for (const m of line.matchAll(TOKEN)) {
    const at = m.index ?? 0;
    const name = m[4];
    const cls = m[1]
      ? 'hljs-comment'
      : m[2]
        ? 'hljs-string'
        : m[3]
          ? 'hljs-number'
          : name && KEYWORDS.has(name)
            ? 'hljs-keyword'
            : name && LITERALS.has(name)
              ? 'hljs-literal'
              : name && /^\s*\(/.test(line.slice(at + name.length))
                ? 'hljs-title function_'
                : null;
    if (!cls) continue;
    if (at > last) out.push(line.slice(last, at));
    out.push(
      <span key={at} className={cls}>
        {m[0]}
      </span>,
    );
    last = at + m[0].length;
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}

/**
 * A code block sets code apart from prose: a tray in the mono face with a header that names it and copies it.
 * Long lines scroll sideways inside it; it is always left to right, also in right-to-left pages.
 */
export const CodeBlock = React.forwardRef<HTMLDivElement, CodeBlockProps>(function CodeBlock(
  { code, title, copy = true, numbered, mark, size = 'md', highlight = true, className, children, ...rest },
  ref,
) {
  const own = useForwardedRef(ref);
  const codeId = useUid('code');
  const withCopy = title != null && copy;
  useBehaviour(own, [withCopy]);
  const source = code ?? (typeof children === 'string' ? children : undefined);
  let body: React.ReactNode = children;
  if (source !== undefined) {
    const lines = source.replace(/^\r?\n/, '').replace(/\r?\n$/, '').split(/\r?\n/);
    const marks = new Set(mark === undefined ? [] : Array.isArray(mark) ? mark : [mark]);
    const draw = (line: string) => (highlight ? tokens(line) : line);
    if (numbered || marks.size) {
      body = lines.map((line, i) => (
        <React.Fragment key={i}>
          {i > 0 ? '\n' : null}
          <span className="tray-code__line" data-mark={marks.has(i + 1) ? '' : undefined}>
            {draw(line)}
          </span>
        </React.Fragment>
      ));
    } else {
      body = lines.map((line, i) => (
        <React.Fragment key={i}>
          {i > 0 ? '\n' : null}
          {draw(line)}
        </React.Fragment>
      ));
    }
  }
  return (
    <div ref={own as React.RefObject<HTMLDivElement>} className={cx('tray-code', numbered && 'tray-code--numbered', size === 'sm' && 'tray-code--sm', className)} dir="ltr" {...rest}>
      {title != null ? (
        <div className="tray-code__head">
          <span>{title}</span>
          {withCopy ? (
            <button className="tray-btn tray-btn--ghost tray-btn--xs" type="button" data-tray="copy" data-target={`#${codeId}`}>
              <Icon name="copy" size="sm" />
              <span data-label="">Copy</span>
            </button>
          ) : null}
        </div>
      ) : null}
      <pre tabIndex={0}>
        <code id={codeId}>{body}</code>
      </pre>
    </div>
  );
});
CodeBlock.displayName = 'CodeBlock';
