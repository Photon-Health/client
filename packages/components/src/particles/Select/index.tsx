import { JSX } from 'solid-js';
import clsx from 'clsx';
import { useInputGroup } from '../InputGroup';

export interface SelectProps {
  value?: string;
  required?: boolean;
  disabled?: boolean;
  name?: string;
  onChange?: JSX.EventHandlerUnion<HTMLSelectElement, Event>;
  onBlur?: JSX.EventHandlerUnion<HTMLSelectElement, FocusEvent>;
  children: JSX.Element;
}

export default function Select(props: SelectProps) {
  const [groupState] = useInputGroup();

  const selectClass = () => {
    const disabled = groupState.disabled || props.disabled;
    const error = groupState.error;
    return clsx(
      'block w-full rounded-lg border-0 py-3 px-4 ring-1 ring-inset text-sm sm:text-base sm:leading-6 focus:outline-none bg-white',
      {
        'ring-red-300 placeholder:text-red-300 focus:ring-2 focus:ring-sky-500/40':
          !!error && !disabled,
        'text-gray-900 ring-gray-300 hover:ring-gray-400 focus:ring-2 focus:ring-sky-500/40':
          !error && !disabled && !!props.value,
        'text-gray-400 ring-gray-300 hover:ring-gray-400 focus:ring-2 focus:ring-sky-500/40':
          !error && !disabled && !props.value,
        'cursor-not-allowed bg-gray-50 text-gray-500 ring-gray-200': !!disabled
      }
    );
  };

  return (
    <select
      id={groupState.id}
      aria-invalid={!!groupState.error || undefined}
      aria-describedby={groupState.error ? `${groupState.id}-error` : undefined}
      aria-required={groupState.required || props.required}
      required={groupState.required || props.required}
      disabled={groupState.disabled || props.disabled}
      onChange={props.onChange}
      onBlur={props.onBlur}
      value={props.value ?? ''}
      class={selectClass()}
      name={props.name}
    >
      {props.children}
    </select>
  );
}
