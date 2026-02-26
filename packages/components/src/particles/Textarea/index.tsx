import { createMemo, createUniqueId, mergeProps } from 'solid-js';
import { useInputGroup } from '../InputGroup';
import clsx from 'clsx';

type TextareaProps = {
  resize?: boolean;
  rows?: number;
  name?: string;
  placeholder?: string;
  value?: string;
  disabled?: boolean;
  onInput?: (value: string) => void;
};

export default function Textarea(props: TextareaProps) {
  const id = createUniqueId();
  const merged = mergeProps(
    {
      resize: false,
      rows: 4,
      placeholder: ''
    },
    props
  );

  const [state] = useInputGroup();

  const textareaClass = createMemo(() =>
    clsx(
      'block w-full touch-pan-y overflow-x-hidden rounded-lg border-0 py-3 px-4 ring-1 ring-inset text-sm sm:text-base sm:leading-6 focus:ring-2 focus:ring-inset focus:outline-none',
      {
        'resize-y': merged.resize,
        'resize-none': !merged.resize,
        'ring-red-300 text-gray-900 placeholder:text-red-300 focus:ring-sky-500/40': !!state.error,
        'ring-gray-300 text-gray-900 placeholder:text-gray-400 hover:ring-gray-400 focus:ring-sky-500/40':
          !state.error && !merged.disabled,
        'cursor-not-allowed bg-gray-50 text-gray-500 ring-gray-200': merged.disabled
      }
    )
  );

  return (
    <textarea
      id={state?.id || (props?.name ?? id)}
      name={props?.name ?? id}
      rows={merged.rows}
      disabled={merged.disabled}
      placeholder={merged.placeholder}
      value={merged.value}
      onInput={(e) => props.onInput?.(e.currentTarget.value)}
      class={textareaClass()}
    />
  );
}
