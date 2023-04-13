import { createSignal } from 'solid-js';
import PharmacySearch from './systems/PharmacySearch';
import Client from './systems/Client';
import SelectLocation from './systems/SelectLocation';

const App = () => {
  const [pharmacy, setPharmacy] = createSignal<any>();

  return (
    <Client
      id="7N9QZujlNJHL8EIPqXpu1wq8OuXqoxKb"
      org="org_KzSVZBQixLRkqj5d"
      domain="auth.boson.health"
      audience="https://api.boson.health"
      uri="https://api.boson.health/graphql"
    >
      <div class="p-5" style={{ width: '600px' }}>
        <div class="p-5 border border-gray-300 rounded-md">
          <PharmacySearch setPharmacy={setPharmacy} />
        </div>
      </div>

      <div class="p-5" style={{ width: '600px' }}>
        <div class="p-5 border border-gray-300 rounded-md">
          <p class="pb-5">SelectLocation Component</p>
          <SelectLocation />
        </div>
      </div>
    </Client>
  );
};

export default App;
