import {
  onMount,
  Show,
  JSX,
  useContext,
  createContext,
  createMemo,
  createEffect,
  splitProps,
  createSignal
} from 'solid-js';
import { Icon } from 'solid-heroicons';
import { chevronUpDown, check } from 'solid-heroicons/solid';
import clickOutside from '../../utils/clickOutside';
import Input, { InputProps } from '../Input';
import { createStore } from 'solid-js/store';
import clsx from 'clsx';
import Spinner from '../Spinner';
import { useInputGroup } from '../InputGroup';

interface ComboBoxState {
  open: boolean;
  selected: { id: string; value: string } | {};
  active: string;
  typing: boolean;
}

interface ComboBoxActions {
  setOpen: (open: boolean) => void;
  setSelected: (selected: any) => void;
  setActive: (active: string) => void;
  setTyping: (typing: boolean) => void;
}

type ComboBoxContextValue = [ComboBoxState, ComboBoxActions];

export const ComboBoxContext = createContext<ComboBoxContextValue>([
  { open: false, selected: {}, active: '', typing: false },
  {
    setOpen: () => {},
    setSelected: () => {},
    setActive: () => {},
    setTyping: () => {}
  }
]);

export function ComboBoxProvider(props: { children?: JSX.Element }) {
  const [state, setState] = createStore<ComboBoxState>({
    open: false,
    selected: {},
    active: '',
    typing: false
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
      },
      setTyping(typing: boolean) {
        setState('typing', typing);
      }
    }
  ];

  return <ComboBoxContext.Provider value={comboBox}>{props.children}</ComboBoxContext.Provider>;
}

export function useComboBox() {
  return useContext(ComboBoxContext);
}

function ComboOptions(props: { children?: JSX.Element }) {
  const [state] = useContext(ComboBoxContext);

  return (
    <Show when={state.open}>
      <ul
        class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
        role="listbox"
        tabindex="-1"
      >
        {props.children}
      </ul>
    </Show>
  );
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

function ComboInput(props: InputProps) {
  const [comboState, { setOpen }] = useComboBox();
  const [inputGroupState] = useInputGroup();
  const [local, restInput] = splitProps(props, ['onInput', 'value']);
  const [selectedLocalValue, setLocalSelectedValue] = createSignal('');
  let inputContainer: HTMLElement;

  onMount(() => {
    clickOutside(inputContainer!, () => {
      setOpen(false);
    });
  });

  createEffect(() => {
    if (comboState.selected?.value) {
      setLocalSelectedValue(comboState.selected.value);
    }
    if (comboState.typing) {
      setLocalSelectedValue('');
    }
    if (!comboState.open) {
      setLocalSelectedValue(comboState.selected?.value || '');
    }
  });

  return (
    <>
      <div ref={inputContainer! as HTMLDivElement}>
        <Input
          {...restInput}
          value={selectedLocalValue()}
          onClick={() => setOpen(!comboState.open)}
          onInput={(e) => {
            // @ts-ignore
            local?.onInput(e);
            setLocalSelectedValue(e.target?.value);
            setOpen(true);
          }}
        />
      </div>
      <button
        class="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none"
        onClick={() => setOpen(!comboState.open)}
      >
        <Show when={!inputGroupState.loading}>
          <Icon path={chevronUpDown} class="h-5 w-5 text-gray-400" />
        </Show>
      </button>
    </>
  );
}

export interface ComboBoxProps {
  children?: JSX.Element;
  value?: any;
  onChange?: (value: any) => void;
  loading?: boolean;
  setSelected?: (selected: any) => void;
}

function ComboBoxWrapper(props: ComboBoxProps) {
  const [state] = useComboBox();

  createEffect(() => {
    if (props.setSelected) {
      props.setSelected(state.selected);
    }
  });

  return <div class="relative">{props.children}</div>;
}

export function ComboBox(props: ComboBoxProps) {
  return (
    <ComboBoxProvider>
      <ComboBoxWrapper {...props}>{props.children}</ComboBoxWrapper>
    </ComboBoxProvider>
  );
}

ComboBox.Input = ComboInput;
ComboBox.Options = ComboOptions;
ComboBox.Option = ComboOption;

export default ComboBox;
