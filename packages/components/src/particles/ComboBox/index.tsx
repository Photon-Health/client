import { onMount, Show, JSX, useContext, createContext, createMemo } from 'solid-js';
import { Icon } from 'solid-heroicons';
import { chevronUpDown, check } from 'solid-heroicons/solid';
import clickOutside from '../../utils/clickOutside';
import Input from '../Input';
import { createStore } from 'solid-js/store';
import clsx from 'clsx';

interface ComboBoxState {
  open: boolean;
  selected: { id: string; value: string } | {};
  active: string;
}

interface ComboBoxActions {
  setOpen: (open: boolean) => void;
  setSelected: (selected: any) => void;
  setActive: (active: string) => void;
}

type ComboBoxContextValue = [ComboBoxState, ComboBoxActions];

export const ComboBoxContext = createContext<ComboBoxContextValue>([
  { open: false, selected: {}, active: '' },
  { setOpen: () => {}, setSelected: () => {}, setActive: () => {} }
]);

export function ComboBoxProvider(props: { children?: JSX.Element }) {
  const [state, setState] = createStore<ComboBoxState>({
    open: false,
    selected: {},
    active: ''
  });
  const comboBox: ComboBoxContextValue = [
    state,
    {
      setOpen(open: boolean) {
        setState('open', open);
      },
      setSelected(selected: any) {
        setState('selected', selected);
      },
      setActive(active: string) {
        setState('active', active);
      }
    }
  ];

  return <ComboBoxContext.Provider value={comboBox}>{props.children}</ComboBoxContext.Provider>;
}

export function useComboBox() {
  return useContext(ComboBoxContext);
}

export interface ComboOptionProps {
  key: string;
  value: string;
  children?: JSX.Element;
}

function ComboOption(props: ComboOptionProps) {
  const [state, { setSelected, setActive }] = useContext(ComboBoxContext);

  const optionClass = createMemo(() =>
    clsx('relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900', {
      'bg-indigo-600 text-white': state.active === props.key
    })
  );

  const iconClass = createMemo(() =>
    clsx('h-5 w-5', state.active === props.key ? 'text-white' : 'text-indigo-600')
  );

  return (
    <li
      class={optionClass()}
      role="option"
      tabindex="-1"
      onClick={() => setSelected({ id: props.key, value: props.value })}
      onMouseEnter={() => setActive(props.key)}
    >
      <span class="block truncate">{props.children}</span>
      <Show when={state.selected?.id === props.key}>
        <span class="absolute inset-y-0 right-0 flex items-center pr-4">
          <Icon path={check} class={iconClass()} />
        </span>
      </Show>
    </li>
  );
}

export interface ComboBoxWrapperProps {
  children?: JSX.Element;
  value?: any;
  onChange?: (value: any) => void;
}

function ComboBoxWrapper(props: ComboBoxWrapperProps) {
  const [state, { setOpen }] = useContext(ComboBoxContext);

  let inputContainer: HTMLElement;

  onMount(() => {
    clickOutside(inputContainer!, () => setOpen(false));
  });

  return (
    <div>
      <div class="relative">
        <div ref={inputContainer! as HTMLDivElement}>
          <Input type="text" value={state?.selected?.value || ''} />
        </div>
        <button
          class="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none"
          onClick={() => setOpen(!state.open)}
        >
          <Icon path={chevronUpDown} class="h-5 w-5 text-gray-400" />
        </button>
        <Show when={state.open}>
          <ul class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {props.children}
          </ul>
        </Show>
      </div>
    </div>
  );
}

export function ComboBox(props: ComboBoxWrapperProps) {
  return (
    <ComboBoxProvider>
      <ComboBoxWrapper {...props}>{props.children}</ComboBoxWrapper>
    </ComboBoxProvider>
  );
}

ComboBox.Option = ComboOption;

export default ComboBox;
