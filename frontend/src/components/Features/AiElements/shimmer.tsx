"use client";
import { cn } from "@/lib/utils";
import { LazyMotion, domAnimation, m } from "motion/react";
import { memo, useMemo } from "react";
import type { ElementType, ReactNode } from "react";

// Cache motion components at module level to avoid creating during render
const motionComponentCache = new Map<ElementType, React.ElementType>();

const getMotionComponent = (element: ElementType) => {
  let component = motionComponentCache.get(element);
  if (!component) {
    component = m.create(element as keyof React.JSX.IntrinsicElements) as React.ElementType;
    motionComponentCache.set(element, component);
  }
  return component;
};

type ShimmerProps = {
  children?: ReactNode;
  as?: ElementType;
  className?: string;
  duration?: number;
  spread?: number;
};

const ShimmerComponent = ({
  children,
  as: Component = "p",
  className,
  duration = 2,
  spread = 2
}: ShimmerProps) => {
  const MotionComponent = getMotionComponent(Component);

  const dynamicSpread = useMemo(() => {
    const textLength = String(children ?? "").length;
    return textLength * spread;
  }, [children, spread]);

  return (
    <LazyMotion features={domAnimation}>
      <MotionComponent
        animate={{ backgroundPosition: "0% center" }}
        className={cn(
          "relative inline-block bg-[length:250%_100%,auto] bg-clip-text text-transparent",
          "[--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--color-background),#0000_calc(50%+var(--spread)))] [background-repeat:no-repeat,padding-box]",
          className
        )}
        initial={{ backgroundPosition: "100% center" }}
        style={
          {
            "--spread": `${dynamicSpread}px`,
            backgroundImage:
              "var(--bg), linear-gradient(var(--color-muted-foreground), var(--color-muted-foreground))"
          } as React.CSSProperties
        }
        transition={{
          duration,
          ease: "linear",
          repeat: Number.POSITIVE_INFINITY,
        }}>
        {children}
      </MotionComponent>
    </LazyMotion>
  );
};

export const Shimmer = memo(ShimmerComponent);
