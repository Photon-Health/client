import {
  createContext,
  createEffect,
  createMemo,
  createUniqueId,
  JSX,
  Show,
  useContext
} from 'solid-js';
import { createStore } from 'solid-js/store';

interface InputGroupState {
  id: string;
  error: string;
  loading: boolean;
  disabled: boolean;
  required: boolean;
}

interface InputGroupActions {
  setError: (error: string) => void;
  setLoading: (loading: boolean) => void;
  setDisabled: (disabled: boolean) => void;
  setRequired: (required: boolean) => void;
}

type InputGroupContextValue = [InputGroupState, InputGroupActions];

export const InputGroupContext = createContext<InputGroupContextValue>([
  { id: '', error: '', loading: false, disabled: false, required: false },
  {
    setError: () => {
      // init method, do nothing.
    },
    setLoading: () => {
      // init method, do nothing.
    },
    setDisabled: () => {
      // init method, do nothing.
    },
    setRequired: () => {
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
    disabled: false,
    required: false
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
      },
      setRequired(required: boolean) {
        setState('required', required);
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
  showOptionalSubtext?: boolean;
  headingSubLabel?: string;
  helpText?: string | JSX.Element;
  children?: JSX.Element;
  loading?: boolean;
  disabled?: boolean;
  required?: boolean;
}

function InputGroupWrapper(props: InputGroupProps) {
  const [state, { setError, setLoading, setDisabled, setRequired }] = useContext(InputGroupContext);
  const ariaDescribedBy = () =>
    props.error ? `${state.id}-error` : props.helpText ? `${state.id}-help` : undefined;

  createEffect(() => {
    setError(props.error || '');
  });

  createEffect(() => {
    setLoading(props.loading || false);
  });

  createEffect(() => {
    setDisabled(props.disabled || false);
  });

  createEffect(() => {
    setRequired(props.required || false);
  });

  const isLabelString = createMemo(() => typeof props.label === 'string');

  return (
    <div>
      <div class="flex justify-between items-center">
        <div>
          <Show when={isLabelString()}>
            <label
              class={`block text-sm font-normal leading-6 text-gray-700 pb-1 ${
                props?.subLabel ? 'mb-0' : ''
              }`}
              for={state.id}
            >
              {props.label}
              <Show when={props.required}>
                <span aria-hidden="true" class="text-red-500 ml-0.5">
                  *
                </span>
              </Show>
              <Show when={props.showOptionalSubtext}>
                <span class="text-xs text-gray-400 ml-2">Optional</span>
              </Show>
            </label>
          </Show>
          <Show when={!isLabelString()}>{props.label}</Show>
          <Show when={props?.subLabel}>
            <div class="text-xs leading-6 text-gray-500">{props.subLabel}</div>
          </Show>
        </div>
        <Show when={props.headingSubLabel}>
          <span class="text-xs text-gray-400">{props.headingSubLabel}</span>
        </Show>
      </div>

      {props.children}

      <div class="h-6">
        <Show when={props.error || props.helpText}>
          <p
            class={`text-sm ${props.error ? 'text-red-400' : 'text-gray-500'}`}
            id={ariaDescribedBy()}
          >
            {props.error || props.helpText}
          </p>
        </Show>
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
