"use client";;
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { cn } from "@/lib/utils";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import {
  createContext,
  lazy,
  memo,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode, HTMLAttributes, ComponentProps } from "react";

const LazyMessageResponse = lazy(() => import("./message-response"));

type MuiButtonVariant = "outlined" | "text" | "contained";
type MuiButtonSize = "small" | "medium" | "large";

const resolveMuiButtonVariant = (variant: string): MuiButtonVariant => {
  switch (variant) {
    case "outline":
      return "outlined";
    case "ghost":
    case "link":
      return "text";
    case "secondary":
    case "destructive":
      return "contained";
    default:
      return "contained";
  }
};

const resolveMuiButtonSize = (size: string): MuiButtonSize => {
  switch (size) {
    case "icon-xs":
    case "icon-sm":
    case "xs":
    case "sm":
      return "small";
    case "lg":
    case "icon-lg":
      return "large";
    default:
      return "medium";
  }
};

type MessageProps = HTMLAttributes<HTMLDivElement> & {
  from?: "user" | "assistant" | string;
  className?: string;
};

export const Message = ({
  className,
  from,
  ...props
}: MessageProps) => (
  <div
    className={cn(
      "group flex w-full max-w-[95%] flex-col gap-2",
      from === "user" ? "is-user ml-auto justify-end" : "is-assistant",
      className
    )}
    {...props} />
);

type MessageContentProps = HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: ReactNode;
};

export const MessageContent = ({
  children,
  className,
  ...props
}: MessageContentProps) => (
  <div
    className={cn(
      "is-user:dark flex w-fit min-w-0 max-w-full flex-col gap-2 overflow-hidden text-sm",
      "group-[.is-user]:ml-auto group-[.is-user]:rounded-lg group-[.is-user]:bg-secondary group-[.is-user]:px-4 group-[.is-user]:py-3 group-[.is-user]:text-foreground",
      "group-[.is-assistant]:text-foreground",
      className
    )}
    {...props}>
    {children}
  </div>
);

type MessageActionsProps = HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: ReactNode;
};

export const MessageActions = ({
  className,
  children,
  ...props
}: MessageActionsProps) => (
  <div className={cn("flex items-center gap-1", className)} {...props}>
    {children}
  </div>
);

type MessageActionProps = {
  tooltip?: string;
  label?: string;
  variant?: string;
  size?: string;
  children?: ReactNode;
} & Omit<ComponentProps<typeof Button>, "size" | "variant">;

export const MessageAction = ({
  tooltip,
  children,
  label,
  variant = "ghost",
  size = "icon-sm",
  ...props
}: MessageActionProps) => {
  const muiVariant = resolveMuiButtonVariant(variant);
  const muiSize = resolveMuiButtonSize(size);
  const button = (
    <Button
      size={muiSize}
      type="button"
      variant={muiVariant}
      color={variant === "destructive" ? "error" : "inherit"}
      {...props}
    >
      {children}
      <span className="sr-only">{label || tooltip}</span>
    </Button>
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip}>
        <span>{button}</span>
      </Tooltip>
    );
  }

  return button;
};

type MessageBranchContextValue = {
  branches: ReactNode[];
  currentBranch: number;
  goToNext: () => void;
  goToPrevious: () => void;
  setBranches: (branches: ReactNode[]) => void;
  totalBranches: number;
};

const MessageBranchContext = createContext<MessageBranchContextValue | null>(null);

const useMessageBranch = () => {
  const context = useContext(MessageBranchContext);

  if (!context) {
    throw new Error("MessageBranch components must be used within MessageBranch");
  }

  return context;
};

type MessageBranchProps = HTMLAttributes<HTMLDivElement> & {
  defaultBranch?: number;
  onBranchChange?: (branch: number) => void;
  className?: string;
};

export const MessageBranch = ({
  defaultBranch = 0,
  onBranchChange,
  className,
  ...props
}: MessageBranchProps) => {
  const [currentBranch, setCurrentBranch] = useState(defaultBranch);
  const [branches, setBranches] = useState<ReactNode[]>([]);

  const handleBranchChange = useCallback((newBranch: number) => {
    setCurrentBranch(newBranch);
    onBranchChange?.(newBranch);
  }, [onBranchChange]);

  const goToPrevious = useCallback(() => {
    const newBranch =
      currentBranch > 0 ? currentBranch - 1 : branches.length - 1;
    handleBranchChange(newBranch);
  }, [currentBranch, branches.length, handleBranchChange]);

  const goToNext = useCallback(() => {
    const newBranch =
      currentBranch < branches.length - 1 ? currentBranch + 1 : 0;
    handleBranchChange(newBranch);
  }, [currentBranch, branches.length, handleBranchChange]);

  const contextValue = useMemo<MessageBranchContextValue>(() => ({
    branches,
    currentBranch,
    goToNext,
    goToPrevious,
    setBranches,
    totalBranches: branches.length,
  }), [branches, currentBranch, goToNext, goToPrevious]);

  return (
    <MessageBranchContext.Provider value={contextValue}>
      <div className={cn("grid w-full gap-2 [&>div]:pb-0", className)} {...props} />
    </MessageBranchContext.Provider>
  );
};

type MessageBranchContentProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};

export const MessageBranchContent = ({
  children,
  ...props
}: MessageBranchContentProps) => {
  const { currentBranch, setBranches, branches } = useMessageBranch();
  const childrenArray = useMemo(() => (Array.isArray(children) ? children : [children]), [children]);

  // Use useEffect to update branches when they change
  useEffect(() => {
    if (branches.length !== childrenArray.length) {
      setBranches(childrenArray);
    }
  }, [childrenArray, branches, setBranches]);

  return (
    <>
      {childrenArray.map((branch, index) => {
        const key = (branch as { key?: string | number } | null)?.key ?? index;
        return (
          <div
            className={cn(
              "grid gap-2 overflow-hidden [&>div]:pb-0",
              index === currentBranch ? "block" : "hidden"
            )}
            key={key}
            {...props}>
            {branch}
          </div>
        );
      })}
    </>
  );
};

type MessageBranchSelectorProps = Omit<ComponentProps<typeof ButtonGroup>, "children"> & {
  className?: string;
};

export const MessageBranchSelector = ({
  className,
  ...props
}: MessageBranchSelectorProps) => {
  const { totalBranches } = useMessageBranch();

  // Don't render if there's only one branch
  if (totalBranches <= 1) {
    return null;
  }

  return (
    <ButtonGroup
      variant="text"
      size="small"
      className={cn(
        "[&>*:not(:first-child)]:rounded-l-md [&>*:not(:last-child)]:rounded-r-md",
        className
      )}
      orientation="horizontal"
      {...props} />
  );
};

type MessageBranchNavProps = Omit<ComponentProps<typeof Button>, "size" | "variant"> & {
  children?: ReactNode;
};

export const MessageBranchPrevious = ({
  children,
  ...props
}: MessageBranchNavProps) => {
  const { goToPrevious, totalBranches } = useMessageBranch();

  return (
    <Button
      aria-label="Previous branch"
      disabled={totalBranches <= 1}
      onClick={goToPrevious}
      size={resolveMuiButtonSize("icon-sm")}
      type="button"
      variant={resolveMuiButtonVariant("ghost")}
      {...props}>
      {children ?? <ChevronLeftIcon size={14} />}
    </Button>
  );
};

export const MessageBranchNext = ({
  children,
  ...props
}: MessageBranchNavProps) => {
  const { goToNext, totalBranches } = useMessageBranch();

  return (
    <Button
      aria-label="Next branch"
      disabled={totalBranches <= 1}
      onClick={goToNext}
      size={resolveMuiButtonSize("icon-sm")}
      type="button"
      variant={resolveMuiButtonVariant("ghost")}
      {...props}>
      {children ?? <ChevronRightIcon size={14} />}
    </Button>
  );
};

type MessageBranchPageProps = HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

export const MessageBranchPage = ({
  className,
  ...props
}: MessageBranchPageProps) => {
  const { currentBranch, totalBranches } = useMessageBranch();

  return (
    <Typography
      component="div"
      className={cn("border-none bg-transparent text-muted-foreground shadow-none", className)}
      {...props}>
      {currentBranch + 1}of {totalBranches}
    </Typography>
  );
};

type MessageResponseProps = {
  className?: string;
  children?: ReactNode;
  enableRich?: boolean;
} & HTMLAttributes<HTMLDivElement>;

export const MessageResponse = memo((props: MessageResponseProps) => {
  const {
    className,
    children,
    enableRich = false,
    ...rest
  } = props;

  return (
    <Suspense
      fallback={(
        <div className={cn("size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0", className)} {...rest}>
          {children}
        </div>
      )}
    >
      <LazyMessageResponse
        className={className}
        enableRich={enableRich}
        {...rest}
      >
        {children}
      </LazyMessageResponse>
    </Suspense>
  );
}, (prevProps, nextProps) => prevProps.children === nextProps.children);

MessageResponse.displayName = "MessageResponse";

type MessageToolbarProps = HTMLAttributes<HTMLDivElement> & {
  className?: string;
  children?: ReactNode;
};

export const MessageToolbar = ({
  className,
  children,
  ...props
}: MessageToolbarProps) => (
  <div
    className={cn("mt-4 flex w-full items-center justify-between gap-4", className)}
    {...props}>
    {children}
  </div>
);
