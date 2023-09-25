import clsx from 'clsx';
import { JSXElement, Show } from 'solid-js';
import { createMemo, mergeProps } from 'solid-js';

export type TextSize = 'lg' | 'md' | 'sm';
export type TextColor = 'black' | 'gray' | 'red';

export interface TextProps {
  size?: TextSize;
  class?: string;
  loading?: boolean;
  selected?: boolean;
  children?: JSXElement | string;
  sampleLoadingText?: string;
  color?: TextColor;
}

export default function Text(props: TextProps) {
  const merged = mergeProps({ size: 'md', color: 'black' }, props);

  const textClasses = createMemo(() =>
    // [overflow-wrap:anywhere] is here to prevent long text from overflowing, should be in tailwind soon
    // https://github.com/tailwindlabs/tailwindcss/discussions/2213#discussioncomment-5316024
    clsx(props.class, 'inline-flex my-px [overflow-wrap:anywhere]', {
      'text-sm leading-snug	': merged.size === 'sm',
      'text-base leading-snug	': merged.size === 'md',
      'text-lg leading-snug	': merged.size === 'lg',
      'text-black': !props.loading && merged.color === 'black',
      'text-slate-500': !props.loading && merged.color === 'gray',
      'text-red-500': !props.loading && merged.color === 'red',
      'text-transparent box-border rounded-md': props.loading,
      'bg-gray-100': !props.selected && props.loading,
      'bg-blue-100': props.selected && props.loading
    })
  );
  return (
    <span class={textClasses()} aria-hidden={props.loading} aria-busy={props.loading}>
      <Show when={!props.loading}>{props.children}</Show>
      <Show when={props.loading}>{props.sampleLoadingText}</Show>
    </span>
  );
}
