import { createSignal } from 'solid-js';
import PharmacySearch from './systems/PharmacySearch';
import DoseCalculator from './systems/DoseCalculator';
import Client from './systems/Client';
import Button from './particles/Button';
import Icon from './particles/Icon';

const App = () => {
  const [pharmacy, setPharmacy] = createSignal<any>();
  const [doseOpen, setDoseOpen] = createSignal(false);

  return (
    <Client
      id="7N9QZujlNJHL8EIPqXpu1wq8OuXqoxKb"
      org="org_KzSVZBQixLRkqj5d"
      domain="auth.boson.health"
      audience="https://api.boson.health"
      uri="https://api.boson.health/graphql"
    >
      <div class="p-5 w-full sm:max-w-lg">
        <div class="p-5 border border-gray-300 rounded-md">
          <PharmacySearch setPharmacy={setPharmacy} />
        </div>
      </div>

      <div class="p-5 w-full sm:max-w-lg">
        <div class="p-5 border border-gray-300 rounded-md">
          <Button onClick={() => setDoseOpen(true)}>
            <Icon name="calculator" size="sm" />
          </Button>
          <DoseCalculator open={doseOpen()} setClose={() => setDoseOpen(false)} />
        </div>
      </div>
    </Client>
  );
};

export default App;
