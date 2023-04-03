import Input from './particles/Input';
import InputGroup from './particles/InputGroup';
import Client from './systems/Client';
import PharmacySearch from './systems/PharmacySearch';

const App = () => {
  return (
    <div class="w-1/2 p-10">
      <InputGroup label="First aoeName" error="omg what happened" />
    </div>
  );
};

export default App;
