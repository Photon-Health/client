import { clsx } from 'clsx';
import { JSX, Show, mergeProps, splitProps, createMemo } from 'solid-js';
import Spinner from '../Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'naked';
export type ButtonSize = 'xl' | 'lg' | 'md' | 'sm' | 'xs';

export interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconLeft?: JSX.Element;
  loading?: boolean;
}

export default function Button(props: ButtonProps) {
  const merged = mergeProps({ variant: 'primary', size: 'lg' }, props);
  const [otherProps, buttonProps] = splitProps(merged, [
    'variant',
    'size',
    'children',
    'iconLeft',
    'loading'
  ]);

  const buttonClasses = createMemo(() =>
    clsx(
      'font-semibold flex justify-center inline-flex items-center gap-x-1',
      {
        'shadow-sm': otherProps.variant !== 'naked',
        'rounded-md': ['xl', 'lg', 'md'].includes(otherProps.size),
        rounded: !['xl', 'lg', 'md'].includes(otherProps.size),
        'text-xs': otherProps.size === 'xs',
        'text-sm': otherProps.size !== 'xs',
        'px-3.5 py-2.5': otherProps.size === 'xl' && otherProps.variant !== 'naked',
        'px-3 py-2': otherProps.size === 'lg' && otherProps.variant !== 'naked',
        'px-2.5 py-1.5': otherProps.size === 'md' && otherProps.variant !== 'naked',
        'px-2 py-1':
          (otherProps.size === 'sm' || otherProps.size === 'xs') && otherProps.variant !== 'naked',
        'text-white bg-blue-600 hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 hover:bg-blue-500':
          otherProps.variant === 'primary',
        'rounded bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50':
          otherProps.variant === 'secondary',
        'bg-blue-50 text-blue-600 hover:bg-blue-100': otherProps.variant === 'tertiary',
        'text-blue-600 hover:text-blue-500 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-300':
          otherProps.variant === 'naked',
        'opacity-50 cursor-not-allowed': buttonProps.disabled
      },
      props?.class
    )
  );

  return (
    <button {...buttonProps} class={buttonClasses()} type={props.type || 'button'}>
      <Show when={otherProps?.loading}>
        <Spinner size="sm" />
      </Show>
      <Show when={otherProps?.iconLeft}>{otherProps?.iconLeft}</Show>
      {merged.children}
    </button>
  );
}
