import React from 'react';

type FontAwesomeIconProps = React.HTMLAttributes<HTMLSpanElement> & {
  icon?: React.ElementType;
  fontSize?: number | string;
  color?: unknown;
  sx?: Record<string, unknown>;
};

const normalizeProps = (props: FontAwesomeIconProps) => {
  const { fontSize, color, icon, ...rest } = props;
  const nextProps: Record<string, unknown> & { sx?: Record<string, unknown> } = {
    ...rest,
  };
  const sx = nextProps.sx ? { ...nextProps.sx } : {};

  // Handle fontSize
  if (typeof fontSize === 'number') {
    sx.fontSize = `${fontSize}px`;
  } else if (fontSize) {
    // If it's "small", "inherit", etc., MUI handles it via fontSize prop
    nextProps.fontSize = fontSize as unknown;
  }

  // Handle color if it's a function (MUI theme function) or a theme path string
  if (typeof color === 'function' || (typeof color === 'string' && color.includes('.'))) {
    sx.color = color;
  } else if (color) {
    // MUI standard colors (primary, secondary, etc.)
    nextProps.color = color as unknown;
  }

  if (Object.keys(sx).length > 0) {
    nextProps.sx = sx;
  }

  return nextProps;
};

const FontAwesomeIcon = React.forwardRef<HTMLSpanElement, FontAwesomeIconProps>(
  ({ icon: Icon, ...props }, ref) => {
  if (!Icon) return null;
  const { fontSize, color, sx, style, className, ...rest } = props;
  const normalizedProps = normalizeProps({ fontSize, color, sx });

  return (
    <span
      ref={ref}
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', ...style }}
      {...rest}
    >
      <Icon {...normalizedProps} />
    </span>
  );
  }
);

export { FontAwesomeIcon };
export default FontAwesomeIcon;
