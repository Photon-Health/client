import { JSX, createSignal, Show, children, createEffect } from 'solid-js';

export interface InputGroupProps {
  label: string;
  error?: string;
  contextText?: string;
  helpText?: string;
  disabled?: boolean;
  children?: JSX.Element;
}

export default function InputGroup(props: InputGroupProps) {
  const { label, error, contextText, helpText } = props;
  const [forId] = createSignal(`input-${Math.random().toString(36).slice(2, 11)}`);
  const ariaDescribedBy = error ? `${forId()}-error` : helpText ? `${forId()}-help` : undefined;

  const resolved = children(() => props?.children);

  createEffect(() => {
    let list = resolved.toArray();
    for (let child of list) child?.setAttribute?.('id', forId());
  });

  return (
    <>
      <div class="flex justify-between">
        <label class="block text-sm font-medium leading-6 text-gray-900 mb-1" for={forId()}>
          {label}
        </label>
        <Show when={!!contextText}>
          <span class="text-sm leading-6 text-gray-500" id="email-optional">
            {contextText}
          </span>
        </Show>
      </div>

      {resolved()}

      <div class="h-6">
        <p class={`mt-1 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`} id={ariaDescribedBy}>
          {error || helpText}
        </p>
      </div>
    </>
  );
}
