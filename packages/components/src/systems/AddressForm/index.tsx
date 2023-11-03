import { createMemo, createSignal, For } from 'solid-js';
import ComboBox from '../../particles/ComboBox';
import Input from '../../particles/Input';
import InputGroup from '../../particles/InputGroup';
import { states } from './states';

export default function AddressForm() {
  const [query, setQuery] = createSignal('');
  const filteredPeople = createMemo(() => {
    return query() === ''
      ? states
      : states.filter((state) => {
          return state.name.toLowerCase().includes(query().toLowerCase());
        });
  });

  return (
    <form>
      <InputGroup label="Address Line 1 *" subLabel="Enter Street Number and Name">
        <Input type="text" />
      </InputGroup>
      <InputGroup label="Address Line 2" subLabel="Enter Apt, Unit, or Suite">
        <Input type="text" />
      </InputGroup>
      <InputGroup label="City *">
        <Input type="text" />
      </InputGroup>
      <div class="grid grid-cols-2 gap-4">
        <InputGroup label="State *">
          <ComboBox>
            <ComboBox.Input
              onInput={(e) => setQuery(e.currentTarget.value)}
              displayValue={(state) => state.name}
            />
            <ComboBox.Options>
              <For each={filteredPeople()}>
                {(state) => (
                  <ComboBox.Option key={state.id} value={state}>
                    {state.name}
                  </ComboBox.Option>
                )}
              </For>
            </ComboBox.Options>
          </ComboBox>
        </InputGroup>
        <InputGroup label="Zip Code *">
          <Input type="text" />
        </InputGroup>
      </div>
    </form>
  );
}
