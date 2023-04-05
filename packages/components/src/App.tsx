import { createSignal } from 'solid-js';
import Input from './particles/Input';
import InputGroup from './particles/InputGroup';

const App = () => {
  const [value, setValue] = createSignal(false);

  return (
    <div class="w-1/2 p-10">
      <InputGroup
        label="Interactive Input"
        helpText="Type 'yes' to see an error."
        error={value() ? 'Yes, there is an error.' : ''}
      >
        <Input
          type="type"
          placeholder="you@example.com"
          onInput={(e) => {
            setValue((e.target as HTMLInputElement).value === 'yes');
          }}
        />
      </InputGroup>
    </div>
  );
};

export default App;
