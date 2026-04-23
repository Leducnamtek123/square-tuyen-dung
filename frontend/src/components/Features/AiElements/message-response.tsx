import { memo, useEffect, useMemo, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

const hasMermaid = (content: string) => /```mermaid[\s\S]*?```/i.test(content);
const hasCode = (content: string) => /```[\s\S]*?```/.test(content) || /`[^`]+`/.test(content);
const hasMath = (content: string) => {
  if (/\$\$[\s\S]*?\$\$/.test(content)) return true;
  try {
    // The 's' (dotAll) flag is ES2018 - wrap in try/catch for older Safari
    return new RegExp("(^|[^\\\\])\\$(.+?)([^\\\\])\\$", "s").test(content);
  } catch {
    return new RegExp("(^|[^\\\\])\\$(.+?)([^\\\\])\\$").test(content);
  }
};

/**
 * Feature-detect whether the JS engine supports ES2018+ regex features
 * used internally by the streamdown library.
 * Cached so the check only runs once per page load.
 */
let _advancedRegexSupported: boolean | null = null;
const supportsAdvancedRegex = (): boolean => {
  if (_advancedRegexSupported !== null) return _advancedRegexSupported;
  try {
    new RegExp("(?<a>.)");     // Named capture groups
    new RegExp("(?<=a)b");     // Lookbehind
    new RegExp("\\p{P}", "u"); // Unicode property escapes
    _advancedRegexSupported = true;
  } catch {
    _advancedRegexSupported = false;
  }
  return _advancedRegexSupported;
};

/* ---------------------------------------------------------------------------
 * Lightweight markdown-to-HTML fallback for browsers that cannot run
 * streamdown (e.g. Safari iOS < 16.4).
 * Handles: headings, bold, italic, inline code, code blocks, links, lists.
 * --------------------------------------------------------------------------- */
const simpleMdToHtml = (md: string): string => {
  let html = md
    // Code blocks
    .replace(/```[\w]*\n([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
    // Inline code
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // Headings
    .replace(/^#### (.+)$/gm, "<h4>$1</h4>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    // Bold + italic
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    // Unordered list items
    .replace(/^\s*[-*] (.+)$/gm, "<li>$1</li>")
    // Ordered list items
    .replace(/^\s*\d+\.\s+(.+)$/gm, "<li>$1</li>")
    // Paragraphs
    .replace(/\n{2,}/g, "</p><p>")
    .replace(/\n/g, "<br/>");

  // Wrap consecutive <li> in <ul>
  html = html.replace(/((?:<li>.*?<\/li>\s*(?:<br\/>)?)+)/g, "<ul>$1</ul>");

  return `<p>${html}</p>`;
};

type MessageResponseInnerProps = {
  className?: string;
  children?: ReactNode;
  enableRich?: boolean;
} & HTMLAttributes<HTMLDivElement>;

type StreamdownPlugins = {
  cjk: unknown;
  code?: unknown;
  math?: unknown;
  mermaid?: unknown;
};

const MessageResponseInner = memo(({
  className,
  children,
  enableRich = false,
  ...props
}: MessageResponseInnerProps) => {
  const content = typeof children === "string" ? children : "";
  const canRunStreamdown = supportsAdvancedRegex();

  const needsMermaid = useMemo(() => canRunStreamdown && hasMermaid(content), [canRunStreamdown, content]);
  const needsCode = useMemo(() => canRunStreamdown && hasCode(content), [canRunStreamdown, content]);
  const needsMath = useMemo(() => canRunStreamdown && hasMath(content), [canRunStreamdown, content]);

  const [streamdownState, setStreamdownState] = useState<{
    Streamdown: React.ElementType | null;
    plugins: StreamdownPlugins | null;
  }>({
    Streamdown: null,
    plugins: null,
  });

  useEffect(() => {
    // On browsers that don't support advanced regex, skip streamdown entirely
    if (!canRunStreamdown || !enableRich) return;

    let cancelled = false;

    const loadStreamdown = async () => {
      try {
        const [{ Streamdown }, { cjk }] = await Promise.all([
          import("streamdown"),
          import("@streamdown/cjk"),
        ]);

        const plugins: StreamdownPlugins = { cjk };

        if (needsCode) {
          const { code } = await import("@streamdown/code");
          plugins.code = code;
        }

        if (needsMath) {
          const { math } = await import("@streamdown/math");
          plugins.math = math;
        }

        if (needsMermaid) {
          const { mermaid } = await import("@streamdown/mermaid");
          plugins.mermaid = mermaid;
        }

        if (!cancelled) {
          setStreamdownState({ Streamdown, plugins });
        }
      } catch (err) {
        console.warn("[MessageResponse] Failed to load streamdown plugins:", err);
      }
    };

    loadStreamdown();

    return () => {
      cancelled = true;
    };
  }, [canRunStreamdown, enableRich, needsCode, needsMath, needsMermaid]);

  const wrapperCn = cn("size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0", className);

  // Not rich mode - plain render
  if (!enableRich) {
    return (
      <div className={wrapperCn} {...props}>
        {children}
      </div>
    );
  }

  // Browser can't run streamdown - lightweight markdown fallback
  if (!canRunStreamdown) {
    return (
      <div
        className={cn(wrapperCn, "streamdown-fallback")}
        dangerouslySetInnerHTML={{ __html: simpleMdToHtml(content) }}
        {...props}
      />
    );
  }

  // Streamdown not loaded yet - show raw text while loading
  if (!streamdownState.Streamdown) {
    return (
      <div className={wrapperCn} {...props}>
        {children}
      </div>
    );
  }

  const Streamdown = streamdownState.Streamdown as React.ElementType;

  return (
    <Streamdown
      className={wrapperCn}
      plugins={streamdownState.plugins}
      {...props}
    >
      {children}
    </Streamdown>
  );
}, (prevProps: MessageResponseInnerProps, nextProps: MessageResponseInnerProps) => prevProps.children === nextProps.children);

MessageResponseInner.displayName = "MessageResponseInner";

export default MessageResponseInner;


