import { JSXElement } from 'solid-js';

interface MedicationSearchItemProps {
  children: JSXElement;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  id?: string;
}

export default function MedicationSearchItem(props: MedicationSearchItemProps) {
  return (
    <div
      id={props.id}
      role="option"
      aria-selected={props.selected ?? false}
      aria-disabled={props.disabled ?? false}
      class={`cursor-pointer select-none px-3 py-2 text-sm ${
        props.disabled
          ? 'opacity-50 cursor-not-allowed'
          : props.selected
            ? 'bg-blue-500 text-white'
            : 'hover:bg-gray-100'
      }`}
      onClick={() => {
        if (!props.disabled) {
          props.onClick?.();
        }
      }}
    >
      {props.children}
    </div>
  );
}