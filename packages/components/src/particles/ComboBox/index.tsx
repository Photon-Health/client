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
import { Dynamic } from 'solid-js/web';

export type ComboBoxValueBase = { id: string };

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

export function useComboBox() {
  return useContext(ComboBoxContext);
}

export interface ComboBoxProps<T extends ComboBoxValueBase> {
  children?: JSX.Element;
  value?: T;
  onOpen?: () => void;
  loading?: boolean;
  setSelected: (selected: T | undefined) => void;
}

export function ComboBox<T extends ComboBoxValueBase>(props: ComboBoxProps<T>) {
  const [state, setState] = createStore<ComboBoxState>({
    open: false,
    selected: {},
    active: '',
    typing: false
  });

  // setup the combobox context value to pass to the provider component
  const comboBox: ComboBoxContextValue = [
    state,
    {
      setOpen(open: boolean) {
        setState('open', open);
        if (open && props.onOpen) {
          props.onOpen();
        }
      },
      setSelected(selected: T | undefined) {
        // set selected will call the prop setSelected to ideally update props.value
        // we now listen for props.value to change and update internal selected state in an effect right below
        // this allows for outside components to update the internal state of this component rather than isolate it
        if (props.value?.id !== selected?.id || props.value === undefined) {
          props.setSelected(selected);
        }
      },
      setActive(active: string) {
        setState('active', active);
      },
      setTyping(typing: boolean) {
        setState('typing', typing);
      }
    }
  ];

  createEffect(() => {
    // update internal selected state when the passed value changes
    setState('selected', props.value);
  });

  return (
    <ComboBoxContext.Provider value={comboBox}>
      <div class="relative">{props.children}</div>
    </ComboBoxContext.Provider>
  );
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

export interface ComboOptionProps<T extends ComboBoxValueBase> {
  key: string;
  value: T;
  disabled?: boolean;
  children?: JSX.Element;
  render?: any;
}

function ComboOption<T extends ComboBoxValueBase>(props: ComboOptionProps<T>) {
  const [state, { setSelected, setActive }] = useContext(ComboBoxContext);
  const active = () => state.active === props.key;

  if (props.disabled) {
    return (
      <li
        class="relative cursor-default select-none py-2 px-3 text-gray-400"
        role="option"
        aria-disabled="true"
        tabindex="-1"
      >
        <span class="block truncate">
          {props.render ? (
            <Dynamic component={props.render} value={props.value} active={active()} />
          ) : (
            props.children
          )}
        </span>
      </li>
    );
  }

  return (
    <li
      class={clsx('flex items-center cursor-pointer select-none py-2 px-3 text-gray-900', {
        'bg-blue-600 text-white': active()
      })}
      role="option"
      tabindex="-1"
      onClick={() => setSelected(props.value)}
      onMouseEnter={() => setActive(props.key)}
      onMouseLeave={() => setActive('')}
    >
      <span class="w-full truncate">
        {props.render ? (
          <Dynamic component={props.render} value={props.value} active={active()} />
        ) : (
          props.children
        )}
      </span>
      <Icon
        name="checkCircle"
        class={clsx(
          'ml-2 shrink-0',
          // Use visibility prop so Icon still occupies space when invisible
          state.selected?.id === props.key ? 'visible' : 'invisible',
          active() ? 'text-white' : 'text-blue-600'
        )}
      />
    </li>
  );
}

interface ComboBoxInputProps<T extends ComboBoxValueBase> {
  displayValue: (item: T) => string;
  showClear?: boolean;
}

function ComboInput<T extends ComboBoxValueBase>(props: ComboBoxInputProps<T> & InputProps) {
  const [state, { setOpen, setSelected }] = useComboBox();
  const [inputGroupState] = useInputGroup();
  const [local, restInput] = splitProps(props, ['onInput', 'onClick', 'value']);
  const [localValue, setLocalValue] = createSignal('');
  let inputContainer: HTMLElement;

  onMount(() => {
    clickOutside(inputContainer!, () => {
      setOpen(false);
    });
  });

  createEffect(() => {
    // update localSelectedValue when internal selected state is changed
    if (state.selected) {
      setLocalValue(props.displayValue(state.selected));
    }
    if (state.selected === undefined) {
      setLocalValue('');
    }
  });

  createEffect(() => {
    // separately, listen for open state to change and reset the display value
    if (!state.open) {
      setLocalValue(state.selected ? props.displayValue(state.selected) : '');
    }
  });

  return (
    <>
      <div ref={inputContainer! as HTMLDivElement}>
        <Input
          {...restInput}
          aria-label={props.label}
          value={localValue() || ''}
          onClick={(e) => {
            setOpen(!state.open);
            if (local?.onClick) {
              // @ts-ignore
              local.onClick(e);
            }
          }}
          onInput={(e) => {
            if (local?.onInput) {
              // @ts-ignore
              local.onInput(e);
            }
            setLocalValue(e.currentTarget.value);
            setOpen(true);
          }}
          type="text"
        />
      </div>
      <Show when={props.showClear && state.selected}>
        <button
          class="absolute inset-y-0 right-8 flex items-center px-1"
          onClick={() => {
            setSelected(undefined);
          }}
          aria-label="Clear selection"
          type="button"
        >
          <span class="text-sm text-gray-400">Clear</span>
        </button>
      </Show>
      <Show when={!inputGroupState.loading && !props.loading}>
        <button
          class="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2"
          onClick={() => setOpen(!state.open)}
          aria-label="Show options"
        >
          <Icon name="chevronUpDown" class="text-gray-400" />
        </button>
      </Show>
    </>
  );
}

ComboBox.Input = ComboInput;
ComboBox.Options = ComboOptions;
ComboBox.Option = ComboOption;

export default ComboBox;
