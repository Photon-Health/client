import clsx from 'clsx';
import { createMemo, For, JSX } from 'solid-js';

export interface CardProps extends JSX.HTMLAttributes<HTMLDivElement> {
  children: JSX.Element | JSX.Element[];
  selected?: boolean;
  gray?: boolean;
}

function Card(props: CardProps) {
  const cardClasses = createMemo(() =>
    clsx('border rounded-lg divide-y divide-gray-300', {
      'border-blue-600 bg-blue-50': props?.selected,
      'border-gray-300 bg-gray-50': props?.gray,
      'border-gray-300 bg-white': !props?.selected && !props?.gray
    })
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
