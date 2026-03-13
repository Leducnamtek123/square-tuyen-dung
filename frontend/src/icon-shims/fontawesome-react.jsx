import React from 'react';

const normalizeProps = (props) => {
  const { fontSize, color, icon, ...nextProps } = props;
  const sx = nextProps.sx ? { ...nextProps.sx } : {};

  // Handle fontSize
  if (typeof fontSize === 'number') {
    sx.fontSize = `${fontSize}px`;
  } else if (fontSize) {
    // If it's "small", "inherit", etc., MUI handles it via fontSize prop
    nextProps.fontSize = fontSize;
  }

  // Handle color if it's a function (MUI theme function) or a theme path string
  if (typeof color === 'function' || (typeof color === 'string' && color.includes('.'))) {
    sx.color = color;
  } else if (color) {
    // MUI standard colors (primary, secondary, etc.)
    nextProps.color = color;
  }

  if (Object.keys(sx).length > 0) {
    nextProps.sx = sx;
  }

  return nextProps;
};

const FontAwesomeIcon = React.forwardRef(({ icon: Icon, ...props }, ref) => {
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
});

export { FontAwesomeIcon };
export default FontAwesomeIcon;
