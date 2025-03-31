import {
  JSX,
  Show,
  createUniqueId,
  createContext,
  useContext,
  createEffect,
  createMemo
} from 'solid-js';
import { createStore } from 'solid-js/store';

interface InputGroupState {
  id: string;
  error: string;
  loading: boolean;
  disabled: boolean;
}

interface InputGroupActions {
  setError: (error: string) => void;
  setLoading: (loading: boolean) => void;
  setDisabled: (disabled: boolean) => void;
}

type InputGroupContextValue = [InputGroupState, InputGroupActions];

export const InputGroupContext = createContext<InputGroupContextValue>([
  { id: '', error: '', loading: false, disabled: false },
  {
    setError: () => {
      // init method, do nothing.
    },
    setLoading: () => {
      // init method, do nothing.
    },
    setDisabled: () => {
      // init method, do nothing.
    }
  }
]);

interface CounterProviderProps {
  error?: string;
  children?: JSX.Element;
}

export function InputGroupProvider(props: CounterProviderProps) {
  const [state, setState] = createStore<InputGroupState>({
    id: `input-${createUniqueId()}`,
    error: props.error || '',
    loading: false,
    disabled: false
  });
  const inputGroup: InputGroupContextValue = [
    state,
    {
      setError(error: string) {
        setState('error', error);
      },
      setLoading(loading: boolean) {
        setState('loading', loading);
      },
      setDisabled(disabled: boolean) {
        setState('disabled', disabled);
      }
    }
  ];

  return (
    <InputGroupContext.Provider value={inputGroup}>{props.children}</InputGroupContext.Provider>
  );
}

export function useInputGroup() {
  return useContext(InputGroupContext);
}

export interface InputGroupProps {
  label: string | JSX.Element;
  subLabel?: string;
  error?: string;
  errors?: string[] | null;
  contextText?: string | JSX.Element;
  helpText?: string | JSX.Element;
  children?: JSX.Element;
  loading?: boolean;
  disabled?: boolean;
}

function InputGroupWrapper(props: InputGroupProps) {
  const [state, { setError, setLoading, setDisabled }] = useContext(InputGroupContext);
  const ariaDescribedBy = props.error
    ? `${state.id}-error`
    : props.helpText
    ? `${state.id}-help`
    : undefined;

  createEffect(() => {
    setError(props.error || '');
  });

  createEffect(() => {
    setLoading(props.loading || false);
  });

  createEffect(() => {
    setDisabled(props.disabled || false);
  });

  const isLabelString = createMemo(() => typeof props.label === 'string');
  const isContextTextString = createMemo(() => typeof props?.contextText === 'string');

  return (
    <div>
      <div class="flex justify-between items-center">
        <div>
          <Show when={isLabelString()}>
            <label
              class={`block text-base font-light leading-6 text-gray-900 ${
                props?.subLabel ? 'mb-0' : ''
              }`}
              for={state.id}
            >
              {props.label}
            </label>
          </Show>
          <Show when={!isLabelString()}>{props.label}</Show>
          <Show when={props?.subLabel}>
            <div class="text-xs leading-6 text-gray-500">{props.subLabel}</div>
          </Show>
        </div>

        <Show when={!!props.contextText}>
          <Show when={isContextTextString}>
            <span class="text-xs leading-6 text-gray-500" id="email-optional">
              {props.contextText}
            </span>
          </Show>
          <Show when={!isContextTextString}>{props.contextText}</Show>
        </Show>
      </div>

      {props.children}

      <div class="h-6">
        <p
          class={`mt-1 text-sm ${props.error ? 'text-red-600' : 'text-gray-500'}`}
          id={ariaDescribedBy}
        >
          {props.error || props.helpText}
        </p>
      </div>
    </div>
  );
}

export function InputGroup(props: InputGroupProps) {
  return (
    <InputGroupProvider error={props.error}>
      <InputGroupWrapper {...props}>{props.children}</InputGroupWrapper>
    </InputGroupProvider>
  );
}

export default InputGroup;
