import { createSignal, createUniqueId, For, onMount, Show } from 'solid-js';
import { Icon } from 'solid-heroicons';
import { chevronUpDown, check } from 'solid-heroicons/solid';
import clickOutside from '../../utils/clickOutside';
import Input from '../Input';

export interface ComboBoxProps {
  value: any;
  onChange: (value: any) => void;
}

export default function ComboBox(props: ComboBoxProps) {
  const [open, setOpen] = createSignal(false);
  const [selected, setSelected] = createSignal<any>();

  const [filteredPeople] = createSignal([
    { id: 1, name: 'John' },
    { id: 2, name: 'Jane' },
    { id: 3, name: 'Joe' },
    { id: 4, name: 'Jill' }
  ]);
  let inputContainer: HTMLElement;

  const dropdownId = createUniqueId();

  onMount(() => {
    clickOutside(inputContainer!, () => setOpen(false));
  });

  return (
    <div>
      <div class="relative mt-2">
        <div ref={inputContainer! as HTMLDivElement}>
          <Input type="text" />
        </div>
        <button
          class="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none"
          onClick={() => setOpen(!open())}
        >
          <Icon path={chevronUpDown} class="h-5 w-5 text-gray-400" />
        </button>
        <Show when={open()}>
          <ul class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            <For each={filteredPeople()}>
              {(person, index) => (
                <li
                  class="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 hover:bg-indigo-600 hover:text-white"
                  onClick={() => {
                    setSelected(person);
                    setOpen(false);
                  }}
                  id={`option-${index()}-${dropdownId}`}
                  role="option"
                  tabindex="-1"
                >
                  <span class="block truncate">{person.name}</span>
                  <Show when={selected()?.id === person.id}>
                    <span class="absolute inset-y-0 right-0 flex items-center pr-4">
                      <Icon path={check} class="h-5 w-5 text-indigo-600" />
                    </span>
                  </Show>
                </li>
              )}
            </For>
          </ul>
        </Show>
      </div>
    </div>
  );
}
