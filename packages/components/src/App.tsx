import { createSignal } from 'solid-js';
import Input from './particles/Input';
import InputGroup from './particles/InputGroup';

const App = () => {
  const [value, setValue] = createSignal(false);
  return (
    <div class="w-1/2 p-10">
      <InputGroup label="Email" helpText="We'll only use this for spam." error="hi">
        <Input
          type="email"
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
