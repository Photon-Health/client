import { clsx } from 'clsx';

type ButtonVariant = 'primary' | 'secondary';
type ButtonSize = 'xl' | 'lg' | 'md' | 'sm' | 'xs';

export interface ButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: string;
}

export default function Button({
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  children
}: ButtonProps) {
  function handleClick() {
    if (!disabled && onClick) {
      onClick();
    }
  }

  const buttonClasses = clsx(
    ['xl', 'lg', 'md'].includes(size) ? 'rounded-md' : 'rounded',
    'font-sans box-border',
    variant === 'primary' ? 'text-primaryText' : 'text-secondaryText',
    variant === 'secondary' ? 'border-2 border-primary600' : 'border-2 border-transparent',
    'shadow-sm',
    'focus-visible:outline',
    'focus-visible:outline-2',
    'focus-visible:outline-offset-2',
    variant === 'primary' ? 'bg-primary600' : 'bg-secondary50',
    size === 'xl' && 'text-lg py-4 px-6',
    size === 'lg' && 'text-base py-3 px-4',
    size === 'md' && 'text-sm py-2 px-3',
    size === 'sm' && 'text-xs py-1.5 px-2.5',
    size === 'xs' && 'text-xs py-1 px-2',
    disabled
      ? 'opacity-50 cursor-not-allowed'
      : 'hover:bg-primary500 focus-visible:outline-primary600'
  );

  return (
    <button class={buttonClasses} type="button" disabled={disabled} onClick={handleClick}>
      {children}
    </button>
  );
}
