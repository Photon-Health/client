import { createSignal } from 'solid-js';
import Input from './particles/Input';
import InputGroup from './particles/InputGroup';
import Spinner from './particles/Spinner';

const App = () => {
  const [value, setValue] = createSignal(false);

  return (
    <div class="w-1/2 p-10">
      <Spinner />
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
    </div>
  );
};

export default App;
