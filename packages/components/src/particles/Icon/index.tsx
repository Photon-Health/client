import clsx from 'clsx';
import { Icon as SolidIcon } from 'solid-heroicons';
import * as icons from 'solid-heroicons/outline';
import { createMemo, mergeProps } from 'solid-js';

export const allIconNames: IconName[] = Object.keys(icons) as IconName[];
export type IconName = keyof typeof icons;
export type IconSize = 'xl' | 'lg' | 'md' | 'sm';

export interface IconProps {
  name: IconName;
  size?: IconSize;
  class?: string;
}

export default function Icon(props: IconProps) {
  const merged = mergeProps({ size: 'md' }, props);
  const iconClasses = createMemo(() =>
    clsx(props.class, {
      'h-4 w-4': merged.size === 'sm',
      'h-6 w-6': merged.size === 'md',
      'h-8 w-8': merged.size === 'lg',
      'h-10 w-10': merged.size === 'xl'
    })
  );
  return <SolidIcon path={icons[props.name]} class={iconClasses()} aria-hidden="true" />;
}
