import { JSX } from 'solid-js';
import clsx from 'clsx';

export interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  id?: string;
  placeholder?: string;
}

export default function Input(props: InputProps) {
  const { error, ...inputProps } = props;

  const inputClass = clsx(
    'block w-full rounded-md border-0 py-1.5 px-2 shadow-sm ring-1 ring-inset sm:text-sm sm:leading-6 focus:outline-none',
    {
      'text-red-900 ring-red-300 placeholder:text-red-300 focus:ring-2 focus:ring-inset focus:ring-red-500':
        !!error,
      'text-gray-900 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600':
        !error
    }
  );

  return <input {...inputProps} class={inputClass} />;
}
