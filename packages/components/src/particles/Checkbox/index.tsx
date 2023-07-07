import { createUniqueId, Show } from 'solid-js';
import { JSXElement, mergeProps } from 'solid-js';

interface CheckboxProps {
  id?: string;
  mainText: string;
  secondaryText?: string;
  checked?: boolean;
  onChange: (checked: boolean) => void;
}

export default function Checkbox(props: CheckboxProps): JSXElement {
  const uniqueId = createUniqueId();

  const mergedProps = mergeProps(
    {
      id: `checkbox-${uniqueId}`,
      checked: false
    },
    props
  );

  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    mergedProps.onChange(target.checked);
  };

  return (
    <div class="relative flex items-start">
      <div class="flex h-6 items-center">
        <input
          id={mergedProps.id}
          aria-describedby={`${mergedProps.id}-description`}
          name={mergedProps.id}
          type="checkbox"
          class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
          checked={mergedProps.checked}
          onChange={handleChange}
        />
      </div>
      <div class="ml-3 text-sm leading-6">
        <label for={mergedProps.id} class="font-medium text-gray-900">
          {mergedProps.mainText}
        </label>
        <Show when={mergedProps?.secondaryText}>
          <span id={`${mergedProps.id}-description`} class="text-gray-500">
            <span class="sr-only">{mergedProps.mainText} </span> {mergedProps.secondaryText}
          </span>
        </Show>
      </div>
    </div>
  );
}
