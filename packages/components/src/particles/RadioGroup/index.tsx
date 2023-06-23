import { createContext, createMemo, JSXElement, onMount, useContext, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import Card from '../Card';
import Icon from '../Icon';

/*
RadioGroup Context
*/
interface RadioGroupState {
  selected: string | undefined;
  options: string[];
}

interface RadioGroupActions {
  setSelected: (selected: string) => void;
  addOption: (option: string) => void;
}

type RadioGroupContextValue = [RadioGroupState, RadioGroupActions];

export const RadioGroupContext = createContext<RadioGroupContextValue>([
  { selected: '', options: [] },
  {
    addOption: () => undefined,
    setSelected: () => undefined
  }
]);

export function RadioGroupProvider(props: { children?: JSXElement }) {
  const [state, setState] = createStore<RadioGroupState>({
    selected: undefined,
    options: []
  });

  const radioGroup: RadioGroupContextValue = [
    state,
    {
      addOption(option: string) {
        setState('options', [...state.options, option]);
      },
      setSelected(selected: string) {
        setState('selected', selected);
      }
    }
  ];

  return (
    <RadioGroupContext.Provider value={radioGroup}>{props.children}</RadioGroupContext.Provider>
  );
}

export function useRadioGroup() {
  return useContext(RadioGroupContext);
}

/*
RadioGroup.Option
*/

export interface RadioGroupOptionProps {
  value: string;
  label?: string;
  children: JSXElement;
}

function Option(props: RadioGroupOptionProps) {
  const [state, actions] = useRadioGroup();

  onMount(() => {
    actions.addOption(props.value);
  });

  const selected = createMemo(() => state.selected === props.value);
  // TODO why is the onclick on Card not working?
  return (
    <div onClick={() => actions.setSelected(props.value)} class="cursor-pointer">
      <Card selected={selected()}>
        <div class="flex justify-between items-center">
          {props.children}
          <div>
            <Show when={selected()}>
              <Icon name="checkCircle" class="text-blue-600" />
            </Show>
            <Show when={!selected()}>
              <div class="rounded-full bg-slate-100 h-5 w-5 mr-1" />
            </Show>
            <label class="sr-only" for={props.value}>
              {props.label}
            </label>
            <input
              type="radio"
              name="mail-order"
              value={props.value}
              checked={selected()}
              class="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-600 sr-only"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

/*
RadioGroup Root
*/
export interface RadioGroupProps {
  label: string;
  children: JSXElement;
}

function RadioGroupRoot(props: RadioGroupProps) {
  return (
    <fieldset>
      <legend class="sr-only">{props.label}</legend>
      <div class="space-y-3">{props.children}</div>
    </fieldset>
  );
}

function RadioGroup(props: RadioGroupProps) {
  return (
    <RadioGroupProvider>
      <RadioGroupRoot {...props}>{props.children}</RadioGroupRoot>
    </RadioGroupProvider>
  );
}

RadioGroup.Option = Option;

export default RadioGroup;
