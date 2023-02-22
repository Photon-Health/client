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
  isDisabled?: boolean;
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
  style,
  size = 'md',
  isOutline,
  isActive,
  isDisabled,
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
    style === 'primary' && `btn-primary`,
    style === 'secondary' && `btn-secondary`,
    style === 'accent' && `btn-accent`,
    style === 'info' && `btn-info`,
    style === 'success' && `btn-success`,
    style === 'warning' && `btn-warning`,
    style === 'error' && `btn-error`,
    style === 'ghost' && `btn-ghost`,
    style === 'link' && `btn-link`,
    size === 'lg' && `btn-lg`,
    size === 'md' && `btn-md`,
    size === 'sm' && `btn-sm`,
    size === 'xs' && `btn-xs`,
    isOutline && 'btn-outline',
    isActive && 'btn-active',
    isDisabled && 'btn-disabled',
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
