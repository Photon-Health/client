import { createMemo, createUniqueId, For } from 'solid-js';
import Text from '../Text';

export type RadioGroupProps<T> = {
  legend: string;
  set: T[];
};

export default function RadioGroup(props: RadioGroupProps<string>) {
  const groupId = createUniqueId();
  const items = createMemo(() => props.set.map((item, idx) => ({ id: idx + 1, name: item })));
  return (
    <fieldset>
      <legend class="text-base text-gray-400 mb-4">{props.legend}</legend>
      <div class="space-y-3">
        <For each={items()}>
          {(item) => (
            <div class="relative flex items-start gap-x-3">
              <div class="flex h-6 items-center">
                <input
                  id={`${groupId}-${item.id}`}
                  name="plan"
                  type="radio"
                  class="h-4 w-4 border-gray-300 text-blue-500 focus:ring-blue-500"
                />
              </div>
              <div class="min-w-0 flex-1 text-sm leading-6">
                <label for={`side-${item.id}`} class="select-none">
                  <Text size="sm">{item.name}</Text>
                </label>
              </div>
            </div>
          )}
        </For>
      </div>
    </fieldset>
  );
}
