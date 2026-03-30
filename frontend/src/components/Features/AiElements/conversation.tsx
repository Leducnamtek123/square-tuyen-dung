"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DownloadIcon from "@mui/icons-material/Download";
import { useCallback } from "react";
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";
import type { ComponentProps, ReactNode, HTMLAttributes } from "react";

export type ConversationMessagePart = {
  type?: string;
  text?: string;
  [key: string]: unknown;
};

export type ConversationMessage = {
  role: string;
  parts?: ConversationMessagePart[];
  [key: string]: unknown;
};

type ConversationProps = ComponentProps<typeof StickToBottom> & {
  className?: string;
  children?: ReactNode;
};

export const Conversation = ({
  className,
  children,
  ...props
}: ConversationProps) => (
  <StickToBottom
    className={cn("relative flex-1 overflow-y-hidden", className)}
    initial="smooth"
    resize="smooth"
    role="log"
    {...props}
  >
    {children}
  </StickToBottom>
);

type ConversationContentProps = ComponentProps<typeof StickToBottom.Content> & {
  className?: string;
  children?: ReactNode;
};

export const ConversationContent = ({
  className,
  children,
  ...props
}: ConversationContentProps) => (
  <StickToBottom.Content className={cn("flex flex-col gap-8 p-4", className)} {...props}>
    {children}
  </StickToBottom.Content>
);

type ConversationEmptyStateProps = HTMLAttributes<HTMLDivElement> & {
  className?: string;
  title?: string;
  description?: string;
  icon?: ReactNode;
  children?: ReactNode;
};

export const ConversationEmptyState = ({
  className,
  title = "No messages yet",
  description = "Start a conversation to see messages here",
  icon,
  children,
  ...props
}: ConversationEmptyStateProps) => (
  <div
    className={cn(
      "flex size-full flex-col items-center justify-center gap-3 p-8 text-center",
      className
    )}
    {...props}>
    {children ?? (
      <>
        {icon && <div className="text-muted-foreground">{icon}</div>}
        <div className="space-y-1">
          <h3 className="font-medium text-sm">{title}</h3>
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
        </div>
      </>
    )}
  </div>
);

type ConversationScrollButtonProps = ComponentProps<typeof Button> & {
  className?: string;
};

export const ConversationScrollButton = ({
  className,
  ...props
}: ConversationScrollButtonProps) => {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  const handleScrollToBottom = useCallback(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  return (!isAtBottom && (
    <Button
      className={cn(
        "absolute bottom-4 left-[50%] translate-x-[-50%] rounded-full dark:bg-background dark:hover:bg-muted",
        className
      )}
      onClick={handleScrollToBottom}
      size="icon-sm"
      variant="outline"
      {...props}>
      <ArrowDownwardIcon fontSize="small" />
    </Button>
  ));
};

const getMessageText = (message: ConversationMessage) => (message?.parts || [])
  .filter((part: ConversationMessagePart) => part.type === "text")
  .map((part: ConversationMessagePart) => part.text || "")
  .join("");

const defaultFormatMessage = (message: ConversationMessage) => {
  const roleLabel =
    message.role.charAt(0).toUpperCase() + message.role.slice(1);
  return `**${roleLabel}:** ${getMessageText(message)}`;
};

export const messagesToMarkdown = (
  messages: Array<ConversationMessage>,
  formatMessage: (message: ConversationMessage, index: number) => string = defaultFormatMessage
) => messages.map((msg, i) => formatMessage(msg, i)).join("\n\n");

type ConversationDownloadProps = {
  messages: Array<ConversationMessage>;
  filename?: string;
  formatMessage?: (message: ConversationMessage, index: number) => string;
  className?: string;
  children?: ReactNode;
} & ComponentProps<typeof Button>;

export const ConversationDownload = ({
  messages,
  filename = "conversation.md",
  formatMessage = defaultFormatMessage,
  className,
  children,
  ...props
}: ConversationDownloadProps) => {
  const handleDownload = useCallback(() => {
    const markdown = messagesToMarkdown(messages, formatMessage);
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, [messages, filename, formatMessage]);

  return (
    <Button
      className={cn(
        "absolute top-4 right-4 rounded-full dark:bg-background dark:hover:bg-muted",
        className
      )}
      onClick={handleDownload}
      size="sm"
      type="button"
      variant="outline"
      {...props}>
      {children ?? <DownloadIcon fontSize="small" />}
    </Button>
  );
};
