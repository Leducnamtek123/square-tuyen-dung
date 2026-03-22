import { memo, useEffect, useMemo, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

const hasMermaid = (content: string) => /```mermaid[\s\S]*?```/i.test(content);
const hasCode = (content: string) => /```[\s\S]*?```/.test(content) || /`[^`]+`/.test(content);
const hasMath = (content: string) => /\$\$[\s\S]*?\$\$/.test(content) || /(^|[^\\])\$(.+?)([^\\])\$/s.test(content);

const STREAMDOWN_CODE_CDN =
  import.meta.env.VITE_STREAMDOWN_CODE_CDN ||
  "https://esm.sh/@streamdown/code@1.1.0";
const STREAMDOWN_MERMAID_CDN =
  import.meta.env.VITE_STREAMDOWN_MERMAID_CDN ||
  "https://esm.sh/@streamdown/mermaid@1.0.2";

type MessageResponseInnerProps = {
  className?: string;
  children?: ReactNode;
  enableRich?: boolean;
} & HTMLAttributes<HTMLDivElement>;

const MessageResponseInner = memo(({
  className,
  children,
  enableRich = false,
  ...props
}: MessageResponseInnerProps) => {
  const content = typeof children === "string" ? children : "";

  const needsMermaid = useMemo(() => hasMermaid(content), [content]);
  const needsCode = useMemo(() => hasCode(content), [content]);
  const needsMath = useMemo(() => hasMath(content), [content]);
  const [streamdownState, setStreamdownState] = useState<{
    Streamdown: any;
    plugins: any;
  }>({
    Streamdown: null,
    plugins: null,
  });

  useEffect(() => {
    let cancelled = false;

    const loadStreamdown = async () => {
      const [{ Streamdown }, { cjk }] = await Promise.all([
        import("streamdown"),
        import("@streamdown/cjk"),
      ]);

      const plugins: any = { cjk };

      if (needsCode) {
        const { code } = await import(/* @vite-ignore */ STREAMDOWN_CODE_CDN);
        plugins.code = code;
      }

      if (needsMath) {
        const { math } = await import("@streamdown/math");
        plugins.math = math;
      }

      if (needsMermaid) {
        const { mermaid } = await import(/* @vite-ignore */ STREAMDOWN_MERMAID_CDN);
        plugins.mermaid = mermaid;
      }

      if (!cancelled) {
        setStreamdownState({ Streamdown, plugins });
      }
    };

    loadStreamdown();

    return () => {
      cancelled = true;
    };
  }, [needsCode, needsMath, needsMermaid]);

  if (!enableRich) {
    return (
      <div
        className={cn("size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0", className)}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (!streamdownState.Streamdown) {
    return (
      <div
        className={cn("size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0", className)}
        {...props}
      >
        {children}
      </div>
    );
  }

  const Streamdown = streamdownState.Streamdown as any;

  return (
    <Streamdown
      className={cn("size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0", className)}
      plugins={streamdownState.plugins}
      {...props}
    >
      {children}
    </Streamdown>
  );
}, (prevProps, nextProps) => prevProps.children === nextProps.children);

MessageResponseInner.displayName = "MessageResponseInner";

export default MessageResponseInner;
