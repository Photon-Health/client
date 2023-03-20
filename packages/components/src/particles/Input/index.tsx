import { clsx } from 'clsx';
import { JSX, Show } from 'solid-js';

export interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required: boolean;
  optional: boolean;
}

export default function Input(props: InputProps) {
  const { children, type, error, ...inputProps } = props;

  return (
    <div>
      <label for="email" class="block text-sm font-medium leading-6 text-gray-900">
        {props.label}
      </label>
      <input
        {...inputProps}
        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        placeholder="you@example.com"
      />
      <Show when={!!error}>
        <p>{error}</p>
      </Show>
    </div>
  );
}
