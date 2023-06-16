import clsx from 'clsx';
import { createMemo, For, JSX } from 'solid-js';

export interface CardProps {
  children: JSX.Element | JSX.Element[];
  selected?: boolean;
}

function Card(props: CardProps) {
  const cardClasses = createMemo(() =>
    clsx(
      {
        'border-blue-600': props?.selected,
        'border-gray-300': !props?.selected
      },
      'border rounded-md bg-white divide-y divide-gray-300'
    )
  );

  return (
    <div class={cardClasses()}>
      {/* Each child element adds a horizontal line with tailwind's "divide-" */}
      <For each={Array.isArray(props.children) ? props.children : [props.children]}>
        {(child) => <div class="px-4 py-3 sm:px-6 sm:py-4">{child}</div>}
      </For>
    </div>
  );
}

export default Card;
