import { JSX, Show, createEffect, createUniqueId, createContext, useContext } from 'solid-js';
import { createStore } from 'solid-js/store';
import Input, { InputProps } from '../Input';

export interface InputGroupProps {
  label: string;
  error?: string;
  contextText?: string;
  helpText?: string;
  disabled?: boolean;
  children?: JSX.Element;
}

interface InputGroupState {
  id: string;
  error: string;
}

interface InputGroupActions {
  setId: (id: string) => void;
  setError: (error: string) => void;
}

type InputGroupContextValue = [InputGroupState, InputGroupActions];

export const InputGroupContext = createContext<InputGroupContextValue>([
  { id: '', error: '' },
  {
    setId: () => {},
    setError: () => {}
  }
]);

interface CounterProviderProps {
  id?: string;
  error?: string;
  children?: JSX.Element;
}

export function InputGroupProvider(props: CounterProviderProps) {
  const [state, setState] = createStore<InputGroupState>({
    id: props.id || '',
    error: props.error || ''
  });
  const inputGroup: InputGroupContextValue = [
    state,
    {
      setId(id: string) {
        setState('id', id);
      },
      setError(error: string) {
        setState('error', error);
      }
    }
  ];

  return (
    <InputGroupContext.Provider value={inputGroup}>{props.children}</InputGroupContext.Provider>
  );
}

function InputGroupInput(props: InputProps) {
  const [state] = useContext(InputGroupContext);
  console.log('state', state);
  return <Input id={state.id} error={!!state.error} {...props} />;
}

function InputGroup(props: InputGroupProps) {
  const { label, error, contextText, helpText, children } = props;
  const [state, { setId, setError }] = useContext(InputGroupContext);
  setId(`input-${createUniqueId()}`);
  const ariaDescribedBy = error ? `${state.id}-error` : helpText ? `${state.id}-help` : undefined;

  createEffect(() => {
    console.log('error', props?.error);
    setError(props?.error || '');
  });

  return (
    <InputGroupProvider>
      <div class="flex justify-between">
        <label class="block text-sm font-medium leading-6 text-gray-900 mb-1" for={state.id}>
          {label}
        </label>
        <Show when={!!contextText}>
          <span class="text-sm leading-6 text-gray-500" id="email-optional">
            {contextText}
          </span>
        </Show>
      </div>

      {children}

      <div class="h-6">
        <p class={`mt-1 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`} id={ariaDescribedBy}>
          {error || helpText}
        </p>
      </div>
    </>
  );
}

InputGroup.Input = InputGroupInput;

export default InputGroup;
