import clsx from 'clsx';
import { createMemo, For, JSX, mergeProps } from 'solid-js';

export interface CardProps extends JSX.HTMLAttributes<HTMLDivElement> {
  children: JSX.Element | JSX.Element[];
  selected?: boolean;
  variant?: 'white' | 'gray';
  addChildrenDivider?: boolean;
  autoPadding?: boolean;
}

function Card(preProps: CardProps) {
  const props = mergeProps({ variant: 'white', autoPadding: true }, preProps);

  const cardClasses = createMemo(() =>
    clsx('border rounded-lg ', {
      'divide-y divide-gray-300': props?.addChildrenDivider,
      'border-blue-600 bg-blue-50': props?.selected,
      'border-gray-300': !props?.selected,
      'bg-white': props?.variant === 'white',
      'bg-gray-50': props?.variant === 'gray'
    })
  );

  return (
    <div class={cardClasses()}>
      {/* addChildrenDivider adds a horizontal line between each child element */}
      <For each={Array.isArray(props.children) ? props.children : [props.children]}>
        {(child) => (
          <div class={clsx({ 'px-4 py-3 sm:px-6 sm:py-4': props.autoPadding })}>{child}</div>
        )}
      </For>
    </div>
  );
}

export default Card;
