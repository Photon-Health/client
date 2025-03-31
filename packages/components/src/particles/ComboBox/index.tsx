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
import Icon from '../Icon';
import clickOutside from '../../utils/clickOutside';
import Input, { InputProps } from '../Input';
import { createStore } from 'solid-js/store';
import clsx from 'clsx';
import { useInputGroup } from '../InputGroup';

interface ComboBoxState {
  open: boolean;
  selected: any; // TODO should update this to a generic T
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
    setOpen: () => undefined,
    setSelected: () => undefined,
    setActive: () => undefined,
    setTyping: () => undefined
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
  let ref: HTMLDivElement | undefined;

  const calculateDropdownPosition = createMemo(() => {
    // this defaults to the dropdown being below the input, but if it's near
    // the bottom of the viewport it will go above
    if (state.open && ref?.getBoundingClientRect) {
      const rect = ref.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      return spaceBelow > spaceAbove ? 'bottom' : 'top';
    }
    return 'bottom';
  });

  const classes = createMemo(() => {
    return clsx(
      'absolute z-10 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm',
      {
        'bottom-full mb-1': calculateDropdownPosition() === 'top',
        'top-full mt-1': calculateDropdownPosition() === 'bottom'
      }
    );
  });

  // ref! => https://github.com/solidjs/solid/issues/116#issuecomment-1487981714
  return (
    <div ref={ref!}>
      <Show when={state.open}>
        <ul class={classes()} role="listbox" tabindex="-1">
          {props.children}
        </ul>
      </Show>
    </div>
  );
}

export interface ComboOptionProps {
  key: string;
  value: any;
  children?: JSX.Element;
}

function ComboOption(props: ComboOptionProps) {
  const [state, { setSelected, setActive }] = useContext(ComboBoxContext);

  const optionClass = createMemo(() =>
    clsx('relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 cursor-pointer', {
      'bg-blue-600 text-white': state.active === props.key
    })
  );

  const iconClass = createMemo(() => {
    return clsx(state.active === props.key ? 'text-white' : 'text-blue-600');
  });

  return (
    <li
      class={optionClass()}
      role="option"
      tabindex="-1"
      onClick={() => setSelected(props.value)}
      onMouseEnter={() => setActive(props.key)}
    >
      <span class="block truncate">{props.children}</span>
      <Show when={state.selected?.id === props.key}>
        <span class="absolute inset-y-0 right-0 flex items-center pr-4">
          <Icon name="checkCircle" class={iconClass()} />
        </span>
      </Show>
    </li>
  );
}

interface ComboBoxInputProps {
  displayValue: (item: any) => string;
}

function ComboInput(props: ComboBoxInputProps & InputProps) {
  const [state, { setOpen }] = useComboBox();
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
    if (state.selected) {
      setLocalSelectedValue(props.displayValue(state.selected));
    }
    if (state.typing) {
      setLocalSelectedValue('');
    }
    if (!state.open) {
      setLocalSelectedValue(props.displayValue(state.selected) || '');
    }
  });

  return (
    <>
      <div ref={inputContainer! as HTMLDivElement}>
        <Input
          {...restInput}
          value={selectedLocalValue() || ''}
          onClick={() => setOpen(!state.open)}
          onInput={(e) => {
            if (local?.onInput) {
              // @ts-ignore
              local?.onInput(e);
            }
            setLocalSelectedValue(e.currentTarget.value);
            setOpen(true);
          }}
          type="text"
        />
      </div>
      <button
        class="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none"
        onClick={() => setOpen(!state.open)}
        title="Input dropdown"
      >
        <Show when={!inputGroupState.loading && !props.loading}>
          <Icon name="chevronUpDown" class="text-gray-400" />
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
  const [state, { setSelected }] = useComboBox();

  onMount(() => {
    if (props.value) {
      setSelected(props.value);
    }
    if (props.setSelected) {
      props.setSelected(state.selected);
    }
  });

  createEffect(() => {
    if (state.selected) {
      props.setSelected?.(state.selected);
    }
  });

  createEffect(() => {
    if (props.value) {
      setSelected(props.value);
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
