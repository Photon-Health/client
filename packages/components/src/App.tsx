import { For, createMemo, createSignal } from 'solid-js';
import Input from './particles/Input';
import InputGroup from './particles/InputGroup';
import Spinner from './particles/Spinner';
import { randomNames } from './sampleData/randomNames';
import ComboBox from './particles/ComboBox';

const App = () => {
  const [value, setValue] = createSignal(false);
  const [query, setQuery] = createSignal('');
  const filteredPeople = createMemo(() => {
    return query() === ''
      ? randomNames
      : randomNames.filter((person) => {
          return person.name.toLowerCase().includes(query().toLowerCase());
        });
  });

  return (
    <div class="w-96 p-10">
      <div class="mb-4">
        <Spinner />
      </div>
      <InputGroup
        label="Interactive Input"
        helpText="Type 'yes' to see an error."
        contextText='Go ahead, try "yes"'
        error={value() ? 'Yes, there is an error.' : ''}
      >
        <Input
          type="type"
          placeholder="Are you going to type 'yes'?"
          onInput={(e) => {
            setValue((e.target as HTMLInputElement).value === 'yes');
          }}
        />
      </InputGroup>

      <InputGroup label="Combo Box" helpText="Select someone's name">
        <ComboBox>
          <ComboBox.Input onInput={(e) => setQuery((e.target as HTMLInputElement).value)} />
          <ComboBox.Options>
            <For each={filteredPeople()}>
              {(person) => (
                <ComboBox.Option key={person.id} value={person.name}>
                  {person.name}
                </ComboBox.Option>
              )}
            </For>
          </ComboBox.Options>
        </ComboBox>
      </InputGroup>
    </div>
  );
};

export default App;
