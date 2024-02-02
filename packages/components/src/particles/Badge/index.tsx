import clsx from 'clsx';
import { createMemo, JSXElement, mergeProps } from 'solid-js';

export type BadgeSize = 'sm' | 'md';
export type BadgeColor =
  | 'gray'
  | 'red'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'indigo'
  | 'purple'
  | 'pink';

export interface BadgeProps {
  size?: BadgeSize;
  color?: BadgeColor;
  class?: string;
  children?: JSXElement;
}

export default function Badge(props: BadgeProps) {
  const merged = mergeProps({ size: 'md', color: 'blue' }, props);

  const badgeClasses = createMemo(() =>
    clsx(
      props.class,
      'inline-flex items-center rounded-full text-xs font-medium whitespace-nowrap',
      {
        'px-2 py-1': merged.size === 'md',
        'px-1.5 py-0.5': merged.size === 'sm',
        'bg-gray-100 text-gray-600 border-gray-300 border-2': merged.color === 'gray',
        'bg-red-100 text-red-700 border-red-300 border-2': merged.color === 'red',
        'bg-yellow-100 text-yellow-800 border-yellow-300 border-2': merged.color === 'yellow',
        'bg-green-100 text-green-700 border-green-300 border-2': merged.color === 'green',
        'bg-blue-100 text-blue-700 border-blue-300 border-2': merged.color === 'blue',
        'bg-indigo-100 text-indigo-700 border-indigo-300 border-2': merged.color === 'indigo',
        'bg-purple-100 text-purple-700 border-purple-300 border-2': merged.color === 'purple',
        'bg-pink-100 text-pink-700 border-pink-300 border-2': merged.color === 'pink'
      }
    )
  );

  return <div class={badgeClasses()}>{props.children}</div>;
}
