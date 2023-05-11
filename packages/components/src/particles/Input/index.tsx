import { JSX, Show, createEffect, createMemo, createSignal, splitProps } from 'solid-js';
import Icon from '../Icon';
import clsx from 'clsx';
import { useInputGroup } from '../InputGroup';
import Spinner from '../Spinner';

export interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  loading?: boolean;
  copy?: boolean;
}

function valueToString(value: string | number | string[] | undefined): string {
  if (typeof value === 'string') {
    return value;
  } else if (typeof value === 'number') {
    return value.toString();
  } else if (Array.isArray(value)) {
    return value.join(', ');
  }
  return '';
}

export default function Input(props: InputProps) {
  const [local, inputProps] = splitProps(props, ['error', 'copy']);
  const [copied, setCopied] = createSignal(false);

  const [state] = useInputGroup();

  const inputClass = createMemo(() => {
    const disabled = state.disabled || inputProps.disabled;
    const error = local.error || state.error;
    const readonly = inputProps.readonly || inputProps.readOnly;
    return clsx(
      'block w-full rounded-md border-0 py-1.5 px-2 shadow-sm ring-1 ring-inset sm:text-sm sm:leading-6 focus:outline-none',
      {
        'pl-10': inputProps.type === 'email',
        'text-red-900 ring-red-300 placeholder:text-red-300 focus:ring-inset focus:ring-red-500':
          !!error && !disabled,
        'text-gray-900 ring-gray-300 placeholder:text-gray-400 focus:ring-inset focus:ring-blue-600':
          !error && !disabled,
        'focus:ring-2': !readonly,
        'cursor-not-allowed bg-gray-50 text-gray-500 ring-gray-200': inputProps.disabled,
        'focus:ring-1 focus:ring-1  focus:outline-0 focus:ring-gray-300 bg-gray-50 text-gray-500 ring-gray-200':
          readonly
      }
    );
  });
  // block w-full rounded-md border-0 py-1.5 px-2 shadow-sm ring-1 ring-inset sm:text-sm sm:leading-6 focus:outline-none text-gray-900 ring-gray-300
  // placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 focus:ring-1 focus:ring-1  focus:outline-0 focus:ring-gray-300 bg-gray-50 text-gray-500 ring-gray-200
  createEffect(() => {
    if (copied()) {
      setTimeout(() => {
        setCopied(false);
      }, 1000);
    }
  });

  return (
    <>
      <div class="relative rounded-md shadow-sm">
        <Show when={inputProps.type === 'email'}>
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Icon name="envelope" class="h-5 w-5 text-gray-400" size="sm" />
          </div>
        </Show>
        <input id={state?.id} {...inputProps} class={inputClass()} autocomplete="off" />
        <Show when={state.loading || inputProps.loading}>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1">
            <Spinner size="sm" />
          </div>
        </Show>
        <Show when={local.copy}>
          <div class="absolute inset-y-0 right-0 flex items-center pr-3">
            <button
              onClick={() => {
                navigator.clipboard.writeText(valueToString(inputProps?.value));
                setCopied(true);
              }}
            >
              <Show when={copied()}>
                <Icon name="check" class="h-5 w-5 text-gray-400" size="sm" />
              </Show>
              <Show when={!copied()}>
                <Icon name="clipboard" class="h-5 w-5 text-gray-400" size="sm" />
              </Show>
            </button>
          </div>
        </Show>
      </div>
    </>
  );
}
