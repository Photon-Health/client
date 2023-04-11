import { clsx } from 'clsx';
import { JSX, mergeProps } from 'solid-js';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary';
export type ButtonSize = 'xl' | 'lg' | 'md' | 'sm' | 'xs';

export interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export default function Button(props: ButtonProps) {
  const merged = mergeProps({ variant: 'primary', size: 'lg' }, props);

  const buttonClasses = clsx('font-semibold shadow-sm', {
    'rounded-md': ['xl', 'lg', 'md'].includes(merged.size),
    rounded: !['xl', 'lg', 'md'].includes(merged.size),
    'text-white bg-indigo-600 hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 hover:bg-indigo-500':
      merged.variant === 'primary',
    'rounded bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50':
      merged.variant === 'secondary',
    'bg-indigo-50 text-indigo-600 hover:bg-indigo-100': merged.variant === 'tertiary',
    'text-sm px-3.5 py-2.5': merged.size === 'xl',
    'text-sm px-3 py-2': merged.size === 'lg',
    'text-sm px-2.5 py-1.5': merged.size === 'md',
    'text-sm px-2 py-1': merged.size === 'sm',
    'text-xs px-2 py-1': merged.size === 'xs',
    'opacity-50 cursor-not-allowed': merged.disabled
  });

  return (
    <button class={buttonClasses} type="button" {...merged}>
      {merged.children}
    </button>
  );
}
