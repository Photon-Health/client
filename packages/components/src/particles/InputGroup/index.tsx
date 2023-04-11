import { JSX, Show, createUniqueId, createContext, useContext, createEffect } from 'solid-js';
import { createStore } from 'solid-js/store';

export interface InputGroupProps {
  label: string;
  error?: string;
  contextText?: string;
  helpText?: string | JSX.Element;
  disabled?: boolean;
  children?: JSX.Element;
  loading?: boolean;
}

interface InputGroupState {
  id: string;
  error: string;
  loading: boolean;
}

interface InputGroupActions {
  setError: (error: string) => void;
  setLoading: (loading: boolean) => void;
}

type InputGroupContextValue = [InputGroupState, InputGroupActions];

export const InputGroupContext = createContext<InputGroupContextValue>([
  { id: '', error: '', loading: false },
  { setError: () => {}, setLoading: () => {} }
]);

interface CounterProviderProps {
  error?: string;
  children?: JSX.Element;
}

export function InputGroupProvider(props: CounterProviderProps) {
  const [state, setState] = createStore<InputGroupState>({
    id: `input-${createUniqueId()}`,
    error: props.error || '',
    loading: false
  });
  const inputGroup: InputGroupContextValue = [
    state,
    {
      setError(error: string) {
        setState('error', error);
      },
      setLoading(loading: boolean) {
        setState('loading', loading);
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

function InputGroupWrapper(props: InputGroupProps) {
  const [state, { setError, setLoading }] = useContext(InputGroupContext);
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

  return (
    <div>
      <div class="flex justify-between">
        <label class="block text-sm font-medium leading-6 text-gray-900 mb-1" for={state.id}>
          {props.label}
        </label>
        <Show when={!!props.contextText}>
          <span class="text-sm leading-6 text-gray-500" id="email-optional">
            {props.contextText}
          </span>
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
