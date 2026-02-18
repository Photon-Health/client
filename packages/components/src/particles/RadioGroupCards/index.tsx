import {
  createContext,
  createMemo,
  createEffect,
  JSXElement,
  onMount,
  useContext,
  Show
} from 'solid-js';
import { createStore } from 'solid-js/store';
import Card from '../Card';
import Icon from '../Icon';

/*
RadioGroupCards Context
*/
interface RadioGroupCardsState {
  selected: string | undefined;
  options: string[];
  fieldsetLabel: string;
}

interface RadioGroupCardsActions {
  setSelected: (selected: string, disabled?: boolean) => void;
  addOption: (option: string) => void;
}

export type RadioGroupCardsContextValue = [RadioGroupCardsState, RadioGroupCardsActions];

export const RadioGroupCardsContext = createContext<RadioGroupCardsContextValue>([
  { selected: '', options: [], fieldsetLabel: '' },
  {
    addOption: () => undefined,
    setSelected: () => undefined
  }
]);

export function RadioGroupCardsProvider(props: RadioGroupCardsProps) {
  // providing initial values, so eslint warnings are kosher
  const [state, setState] = createStore<RadioGroupCardsState>({
    selected: props.initSelected,
    options: [],
    fieldsetLabel: props.label
  });

  const radioGroup: RadioGroupCardsContextValue = [
    state,
    {
      addOption(option: string) {
        setState('options', [...state.options, option]);
      },
      setSelected(selected: string, disabled?: boolean) {
        if (disabled) {
          return;
        }
        setState('selected', selected);
        if (props?.setSelected) {
          props.setSelected(selected);
        }
      }
    }
  ];

  createEffect(() => {
    if (props.value) {
      setState('selected', props.value);
    }
  });

  createEffect(() => {
    if (props.contextRef) {
      props.contextRef(radioGroup);
    }
  });

  return (
    <RadioGroupCardsContext.Provider value={radioGroup}>
      {props.children}
    </RadioGroupCardsContext.Provider>
  );
}

export function useRadioGroupCards() {
  return useContext(RadioGroupCardsContext);
}

/*
RadioGroupCards.Option
*/

export interface RadioGroupCardsOptionProps {
  value: string;
  label?: string;
  disabled?: boolean;
  alert?: JSXElement;
  children: JSXElement;
}

function Option(props: RadioGroupCardsOptionProps) {
  const [state, actions] = useRadioGroupCards();

  onMount(() => {
    actions.addOption(props.value);
  });

  const selected = createMemo(() => state.selected === props.value);

  // TODO why is the onclick on Card not working?
  return (
    <div
      onClick={() => actions.setSelected(props.value, props.disabled)}
      class={props.disabled ? '' : 'cursor-pointer'}
    >
      <Card selected={selected()} disabled={props.disabled}>
        <div>
          <div class="flex justify-between items-center">
            {props.children}

            <div>
              <Show when={selected()}>
                <Icon name="checkCircle" class="text-blue-600" />
              </Show>
              <Show when={!selected() && !props.disabled}>
                <div class="rounded-full bg-slate-100 h-5 w-5 mr-1" />
              </Show>
              <label class="sr-only" for={props.value}>
                {props.label}
              </label>
              <input
                type="radio"
                name={state.fieldsetLabel}
                id={props.value}
                value={props.value}
                checked={selected()}
                disabled={props.disabled}
                class="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-600 sr-only"
              />
            </div>
          </div>
          <Show when={props.alert}>
            <div class="pt-4">{props.alert}</div>
          </Show>
        </div>
      </Card>
    </div>
  );
}

/*
RadioGroupCards Root
*/
export interface RadioGroupCardsProps {
  label: string;
  value?: string;
  initSelected?: string;
  children: JSXElement;
  setSelected?: (selected: string) => void;
  contextRef?: (context: RadioGroupCardsContextValue) => void;
}

function RadioGroupCardsRoot(props: RadioGroupCardsProps) {
  const [, actions] = useRadioGroupCards();

  onMount(() => {
    if (props.initSelected) {
      actions.setSelected(props.initSelected);
    }
  });

  return (
    <fieldset>
      <legend class="sr-only">{props.label}</legend>
      <div class="space-y-3">{props.children}</div>
    </fieldset>
  );
}

function RadioGroupCards(props: RadioGroupCardsProps) {
  return (
    <RadioGroupCardsProvider {...props}>
      <RadioGroupCardsRoot {...props}>{props.children}</RadioGroupCardsRoot>
    </RadioGroupCardsProvider>
  );
}

RadioGroupCards.Option = Option;

export default RadioGroupCards;
