import { For, JSX } from 'solid-js';
import clsx from 'clsx';
import { useInputGroup } from '../InputGroup';

export const SEX_OPTIONS = [
  { value: 'MALE', name: 'Male' },
  { value: 'FEMALE', name: 'Female' },
  { value: 'UNKNOWN', name: 'Unknown' }
];

export interface SexSelectProps {
  value?: string;
  required?: boolean;
  disabled?: boolean;
  onChange?: JSX.EventHandlerUnion<HTMLSelectElement, Event>;
  onBlur?: JSX.EventHandlerUnion<HTMLSelectElement, FocusEvent>;
}

export default function SexSelect(props: SexSelectProps) {
  const [state] = useInputGroup();

  const selectClass = () => {
    const disabled = state.disabled || props.disabled;
    const error = state.error;
    return clsx(
      'block w-full rounded-lg border-0 py-3 px-4 ring-1 ring-inset text-sm sm:text-base sm:leading-6 focus:outline-none bg-white',
      {
        'ring-red-300 placeholder:text-red-300 focus:ring-2 focus:ring-sky-500/40':
          !!error && !disabled,
        'text-gray-900 ring-gray-300 hover:ring-gray-400 focus:ring-2 focus:ring-sky-500/40':
          !error && !disabled,
        'cursor-not-allowed bg-gray-50 text-gray-500 ring-gray-200': disabled
      }
    );
  };

  return (
    <select
      id={state.id}
      aria-invalid={!!state.error || undefined}
      aria-describedby={state.error ? `${state.id}-error` : undefined}
      aria-required={props.required}
      required={props.required}
      value={props.value ?? ''}
      disabled={state.disabled || props.disabled}
      onChange={props.onChange}
      onBlur={props.onBlur}
      class={selectClass()}
    >
      <option value="" disabled>
        Select sex
      </option>
      <For each={SEX_OPTIONS}>
        {(opt) => (
          <option value={opt.value} selected={props.value === opt.value}>
            {opt.name}
          </option>
        )}
      </For>
    </select>
  );
}
