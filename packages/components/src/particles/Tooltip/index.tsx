import { JSXElement } from 'solid-js';

export type TooltipProps = {
  children: JSXElement;
  text: string;
};

export default function Tooltip(props: TooltipProps) {
  return (
    <div class="group relative w-max">
      {props.children}
      <span class="pointer-events-none absolute -bottom-8 left-0 w-max rounded bg-gray-900 px-2 py-1 text-sm font-medium text-gray-50 opacity-0 shadow transition-opacity group-hover:opacity-100">
        {props.text}
      </span>
    </div>
  );
}
