import { createSignal } from 'solid-js';
import { clsx } from 'clsx';

type ButtonStyle =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'ghost'
  | 'link';
type ButtonSize = 'lg' | 'md' | 'sm' | 'xs';

interface ButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  style?: ButtonStyle;
  size?: ButtonSize;
  isOutline?: boolean;
  isActive?: boolean;
  isDisabledVariant?: boolean;
  isGlass?: boolean;
  isLoading?: boolean;
  hasNoAnimation?: boolean;
  isWide?: boolean;
  isBlock?: boolean;
  isCircle?: boolean;
  isSquare?: boolean;
  className?: string;
  children: string;
}

export default function Button({
  onClick,
  disabled = false,
  style = 'primary',
  size = 'md',
  isOutline,
  isActive,
  isDisabledVariant,
  isGlass,
  isLoading,
  hasNoAnimation,
  isWide,
  isBlock,
  isCircle,
  isSquare,
  className,
  children
}: ButtonProps) {
  function handleClick() {
    if (!disabled && onClick) {
      onClick();
    }
  }

  const buttonClasses = clsx(
    'btn',
    `btn-${style}`,
    `btn-${size}`,
    isOutline && 'btn-outline',
    isActive && 'btn-active',
    isDisabledVariant && 'btn-disabled',
    isGlass && 'glass',
    isLoading && 'loading',
    hasNoAnimation && 'no-animation',
    isWide && 'btn-wide',
    isBlock && 'btn-block',
    isCircle && 'btn-circle',
    isSquare && 'btn-square',
    disabled && 'disabled',
    className
  );

  return (
    <button class={buttonClasses} type="button" disabled={disabled} onClick={handleClick}>
      {children}
    </button>
  );
}
