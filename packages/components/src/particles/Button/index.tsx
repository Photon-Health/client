import { clsx } from 'clsx';

type ButtonVariant =
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

export interface ButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
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
  variant,
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
    // why so verbose? https://github.com/saadeghi/daisyui/discussions/1631#discussioncomment-5081856
    variant === 'primary' && `btn-primary`,
    variant === 'secondary' && `btn-secondary`,
    variant === 'accent' && `btn-accent`,
    variant === 'info' && `btn-info`,
    variant === 'success' && `btn-success`,
    variant === 'warning' && `btn-warning`,
    variant === 'error' && `btn-error`,
    variant === 'ghost' && `btn-ghost`,
    variant === 'link' && `btn-link`,
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
