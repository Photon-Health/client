import { JSX, Show } from 'solid-js';
import { Icon } from 'solid-heroicons';
import { envelope } from 'solid-heroicons/solid';
import clsx from 'clsx';

export interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export default function Input(props: InputProps) {
  const { error, type, disabled, ...inputProps } = props;

  const inputClass = clsx(
    'block w-full rounded-md border-0 py-1.5 px-2 shadow-sm ring-1 ring-inset sm:text-sm sm:leading-6 focus:outline-none',
    {
      'pl-10': type === 'email',
      'text-red-900 ring-red-300 placeholder:text-red-300 focus:ring-2 focus:ring-inset focus:ring-red-500':
        !!error && !disabled,
      'text-gray-900 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600':
        !error && !disabled,
      'cursor-not-allowed bg-gray-50 text-gray-500 ring-gray-200': disabled
    }
  );

  return (
    <>
      <div class="relative rounded-md shadow-sm">
        <Show when={type === 'email'}>
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Icon path={envelope} class="h-5 w-5 text-gray-400" />
          </div>
        </Show>
        <input {...inputProps} class={inputClass} disabled={disabled} />
      </div>
    </>
  );
}
