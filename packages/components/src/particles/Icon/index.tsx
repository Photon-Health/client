import clsx from 'clsx';
import { Icon as SolidIcon } from 'solid-heroicons';
import * as icons from 'solid-heroicons/outline';
import { createMemo, mergeProps, Show } from 'solid-js';

export const allIconNames: IconName[] = Object.keys(icons) as IconName[];
export type IconName = keyof typeof icons;
export type IconSize = 'xl' | 'lg' | 'md' | 'sm';

export interface IconProps {
  name: IconName | undefined;
  size?: IconSize;
  class?: string;
}

export default function Icon(props: IconProps) {
  const merged = mergeProps({ size: 'md', name: 'exclamationMark' as IconName }, props);
  const iconClasses = createMemo(() =>
    clsx(props.class, {
      'h-4 w-4': merged.size === 'sm',
      'h-6 w-6': merged.size === 'md',
      'h-8 w-8': merged.size === 'lg',
      'h-10 w-10': merged.size === 'xl'
    })
  );
  // show against props.name to avoid showing the icon when props.name is an empty string,
  // but using merged because it's showing a type error. Need to upgrade to later version of Solid,
  // but that is giving me an error when I try to upgrade and deploy the app. TODO
  return (
    <Show when={props.name}>
      <SolidIcon path={icons[merged.name]} class={iconClasses()} aria-hidden="true" />
    </Show>
  );
}
