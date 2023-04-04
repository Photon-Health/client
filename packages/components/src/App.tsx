import Input from './particles/Input';
import InputGroup from './particles/InputGroup';

const App = () => {
  return (
    <div class="w-1/2 p-10">
      <InputGroup label="First aoeName" error="omg what happened">
        <Input placeholder="First aoeName" error />
      </InputGroup>
    </div>
  );
};

export default App;
