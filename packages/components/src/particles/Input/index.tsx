import { JSX, Show, createEffect, createMemo, createSignal, splitProps } from 'solid-js';
import Icon from '../Icon';
import clsx from 'clsx';
import { useInputGroup } from '../InputGroup';
import Spinner from '../Spinner';

export interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  loading?: boolean;
  copy?: boolean;
  onInput?: JSX.EventHandlerUnion<HTMLInputElement, InputEvent>;
  pointer?: boolean;
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
  const [nonNativeProps, nativeProps] = splitProps(props, ['error', 'copy']);
  const [handler, inputProps] = splitProps(nativeProps, ['onInput']);
  const [copied, setCopied] = createSignal(false);

  const [state] = useInputGroup();

  const inputClass = createMemo(() => {
    const disabled = state.disabled || inputProps.disabled;
    const error = nonNativeProps.error || state.error;
    const readonly = inputProps.readonly || inputProps.readOnly;
    return clsx(
      'block w-full rounded-lg border-0 py-3 px-4 shadow-sm ring-1 ring-inset text-sm sm:text-base sm:leading-6 focus:outline-none',
      {
        'pl-10': inputProps.type === 'email',
        'ring-red-300 placeholder:text-red-300 focus:ring-inset focus:ring-red-500':
          !!error && !disabled,
        'text-gray-900 ring-gray-300 placeholder:text-gray-400 focus:ring-inset focus:ring-blue-600':
          !error && !disabled,
        'focus:ring-2': !readonly,
        'cursor-not-allowed bg-gray-50 text-gray-500 ring-gray-200': inputProps.disabled,
        'focus:ring-1 focus:ring-1  focus:outline-0 focus:ring-gray-300 bg-gray-50 text-gray-500 ring-gray-200':
          readonly,
        'cursor-pointer': props.pointer
      }
    );
  });

  const handleInput: JSX.EventHandlerUnion<HTMLInputElement, InputEvent> = (e) => {
    // We're intercepting number input handlers with this function in order to prevent mobile browsers
    // from clearing the input when "." is typed.
    const target = e.currentTarget as HTMLInputElement;
    if (!isNaN(target.valueAsNumber) && typeof handler.onInput === 'function') {
      handler.onInput(e);
    }
  };

  createEffect(() => {
    if (copied()) {
      setTimeout(() => {
        setCopied(false);
      }, 1000);
    }
  });

  return (
    <>
      <div class="relative rounded-lg shadow-sm">
        <Show when={inputProps.type === 'email'}>
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Icon name="envelope" class="h-5 w-5 text-gray-400" size="sm" />
          </div>
        </Show>
        <input
          id={state?.id}
          onInput={inputProps.type === 'number' ? handleInput : handler.onInput}
          {...inputProps}
          class={inputClass()}
          autocomplete="off"
        />
        <Show when={state.loading || inputProps.loading}>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1">
            <Spinner size="sm" />
          </div>
        </Show>
        <Show when={nonNativeProps.copy}>
          <div class="absolute inset-y-0 right-0 flex items-center pr-3">
            <button
              onClick={() => {
                navigator.clipboard.writeText(valueToString(inputProps?.value));
                setCopied(true);
              }}
              aria-label="Drop Down for more options"
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
