import { clsx } from 'clsx';
import { JSX } from 'solid-js';

type ButtonVariant = 'primary' | 'secondary';
type ButtonSize = 'xl' | 'lg' | 'md' | 'sm' | 'xs';

export interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  disabled?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export default function Button(props: ButtonProps) {
  const { disabled, size = 'md', variant = 'primary', children, ...buttonProps } = props;

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
    <button class={buttonClasses} type="button" disabled={disabled} {...buttonProps}>
      {children}
    </button>
  );
}
