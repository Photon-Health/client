import {
  DisclosureStateChild,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition
} from 'terracotta';
import type { JSX } from 'solid-js';
import { createSignal, For } from 'solid-js';
import { createField } from '@felte/solid';
import Icon from '../Icon';
import clsx from 'clsx';
import { useInputGroup } from '../InputGroup';

type ListItem = {
  id?: string;
  value?: string;
  name: string;
};

type ListSelectProps = {
  selectMessage: string;
  list: ListItem[];
  name: string; // name of input
};

export default function ListSelect(props: ListSelectProps): JSX.Element {
  const [selected, setSelected] = createSignal<ListItem>({ name: props.selectMessage });
  const { field, onInput } = createField(props.name);

  const [state] = useInputGroup();

  return (
    <>
      <Listbox
        ref={field}
        defaultOpen={false}
        value={selected()}
        onSelectChange={(item?: ListItem) => {
          setSelected(item ?? { name: props.selectMessage });
          onInput(item?.name ?? '');
        }}
        class="relative shadow-sm rounded-lg"
      >
        <ListboxButton
          type="button"
          class={`block text-left w-full rounded-lg border-0 py-3 px-4 shadow-sm ring-1 ring-inset text-sm sm:text-base sm:leading-6 focus:outline-none text-gray-900 ring-gray-300 placeholder:text-gray-400 focus:ring-inset focus:ring-blue-600 focus:ring-2
          ${
            state.error
              ? 'ring-red-300 placeholder:text-red-300 focus:ring-inset focus:ring-red-500'
              : ''
          }
          `}
        >
          <span class="block truncate">{selected()?.name ?? ''}</span>
          <span class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <Icon name="chevronDown" class="w-5 h-5 text-gray-400" size="sm" />
          </span>
        </ListboxButton>
        <DisclosureStateChild>
          {({ isOpen }): JSX.Element => (
            <Transition
              show={isOpen()}
              enter="transition ease-in duration-100"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition ease-out duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <ListboxOptions
                unmount={false}
                class="absolute w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-10"
              >
                <For each={props.list}>
                  {(person): JSX.Element => (
                    <ListboxOption class="focus:outline-none group" value={person}>
                      {({ isActive, isSelected }): JSX.Element => (
                        <div
                          class={clsx(
                            isActive() ? 'text-blue-900 bg-blue-100' : 'text-gray-900',
                            'group-hover:text-blue-900 group-hover:bg-blue-100',
                            'cursor-default select-none relative py-2 pl-10 pr-4'
                          )}
                        >
                          <span
                            class={clsx(
                              isSelected() ? 'font-medium' : 'font-normal',
                              'block truncate'
                            )}
                          >
                            {person.name}
                          </span>
                          {isSelected() ? (
                            <span
                              class={clsx(
                                isActive() ? 'text-blue-600' : 'text-blue-600',
                                'group-hover:text-blue-600',
                                'absolute inset-y-0 left-0 flex items-center pl-3'
                              )}
                            >
                              <Icon name="checkCircle" />
                            </span>
                          ) : null}
                        </div>
                      )}
                    </ListboxOption>
                  )}
                </For>
              </ListboxOptions>
            </Transition>
          )}
        </DisclosureStateChild>
      </Listbox>
    </>
  );
}
