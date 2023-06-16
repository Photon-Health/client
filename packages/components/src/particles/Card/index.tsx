import { For, JSX } from 'solid-js';

export interface CardProps {
  children: JSX.Element | JSX.Element[];
}

function Card(props: CardProps) {
  return (
    <div class="rounded-md border border-gray-300 bg-white divide-y divide-gray-300">
      {/* Each child element adds a horizontal line tailwind's "divide-" */}
      <For each={Array.isArray(props.children) ? props.children : [props.children]}>
        {(child) => <div class="px-6 py-4">{child}</div>}
      </For>
    </div>
  );
}

export default Card;
