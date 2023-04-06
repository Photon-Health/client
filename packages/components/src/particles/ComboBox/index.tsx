import { onMount, Show, JSX, useContext, createContext } from 'solid-js';
import { Icon } from 'solid-heroicons';
import { chevronUpDown } from 'solid-heroicons/solid';
import clickOutside from '../../utils/clickOutside';
import Input from '../Input';
import { createStore } from 'solid-js/store';

interface ComboBoxState {
  open: boolean;
  selected: any;
}

interface ComboBoxActions {
  setOpen: (open: boolean) => void;
  setSelected: (selected: any) => void;
}

type ComboBoxContextValue = [ComboBoxState, ComboBoxActions];

export const ComboBoxContext = createContext<ComboBoxContextValue>([
  { open: false, selected: null },
  { setOpen: () => {}, setSelected: () => {} }
]);

export function ComboBoxProvider(props: { children?: JSX.Element }) {
  const [state, setState] = createStore<ComboBoxState>({
    open: false,
    selected: null
  });
  const comboBox: ComboBoxContextValue = [
    state,
    {
      setOpen(open: boolean) {
        setState('open', open);
      },
      setSelected(selected: any) {
        setState('selected', selected);
      }
    }
  ];

  return <ComboBoxContext.Provider value={comboBox}>{props.children}</ComboBoxContext.Provider>;
}

export function useComboBox() {
  return useContext(ComboBoxContext);
}

export interface ComboOptionProps {
  children?: JSX.Element;
}

function ComboOption(props: ComboOptionProps) {
  return (
    <li
      class="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 hover:bg-indigo-600 hover:text-white"
      role="option"
      tabindex="-1"
    >
      <span class="block truncate">{props.children}</span>
      {/* <Show when={selected()?.id === person.id}>
        <span class="absolute inset-y-0 right-0 flex items-center pr-4">
          <Icon path={check} class="h-5 w-5 text-indigo-600" />
        </span>
      </Show> */}
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
          <Input type="text" />
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
