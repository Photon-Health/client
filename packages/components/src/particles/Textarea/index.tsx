import { createUniqueId, mergeProps } from 'solid-js';

type TextareaProps = {
  resize?: boolean;
  rows?: number;
  name?: string;
  placeholder?: string;
};

export default function Textarea(props: TextareaProps) {
  const id = createUniqueId();
  const merged = mergeProps(
    {
      resize: false,
      rows: 4,
      name: 'Comment',
      placeholder: ''
    },
    props
  );

  return (
    <>
      <label for={id} class="hidden">
        {merged.name}
      </label>
      <textarea
        rows={merged.rows}
        name={id}
        id={id}
        class={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 ${
          merged.resize ? 'resize-y' : 'resize-none'
        }`}
        placeholder={merged.placeholder}
      />
    </>
  );
}
