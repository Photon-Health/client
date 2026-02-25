import { createUniqueId, JSXElement, mergeProps, Show } from 'solid-js';
import Icon from '../Icon';
import Tooltip from '../Tooltip';

interface CheckboxProps {
  id?: string;
  mainText: string;
  secondaryText?: string;
  tooltip?: string;
  showOptionalSubtext?: boolean;
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
    <div class="relative flex items-center">
      <input
        id={mergedProps.id}
        aria-describedby={`${mergedProps.id}-description`}
        name={mergedProps.id}
        type="checkbox"
        class="h-4 w-4 flex-shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
        checked={mergedProps.checked}
        onChange={handleChange}
      />
      <div class="ml-3 text-sm leading-none">
        <div class="flex items-center gap-1">
          <label for={mergedProps.id} class="m-0 font-medium text-gray-500">
            {mergedProps.mainText}
          </label>
          <Show when={mergedProps.tooltip}>
            <Tooltip text={mergedProps.tooltip!}>
              <Icon name="informationCircle" size="sm" class="text-gray-400 cursor-help" />
            </Tooltip>
          </Show>
        </div>
        <Show when={mergedProps?.secondaryText}>
          <label
            for={mergedProps.id}
            id={`${mergedProps.id}-description`}
            class="m-0 text-gray-500 text-xs cursor-pointer"
          >
            <span class="sr-only">{mergedProps.mainText} </span>
            {mergedProps.secondaryText}
          </label>
        </Show>
        <Show when={mergedProps.showOptionalSubtext}>
          <label for={mergedProps.id} class="m-0 text-gray-400 text-xs cursor-pointer">
            Optional
          </label>
        </Show>
      </div>
    </div>
  );
}
