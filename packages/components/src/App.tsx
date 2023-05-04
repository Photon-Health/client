import { For, createEffect, createMemo, createSignal } from 'solid-js';
import PharmacySearch from './systems/PharmacySearch';
import DoseCalculator from './systems/DoseCalculator';
import Client from './systems/Client';
import Button from './particles/Button';
import Icon from './particles/Icon';
import { randomNames } from './sampleData/randomNames';
import ComboBox from './particles/ComboBox';

const App = () => {
  const [pharmacy, setPharmacy] = createSignal<any>();
  const [doseOpen, setDoseOpen] = createSignal(false);
  const [query, setQuery] = createSignal('');
  const rando = randomNames.slice(0, 3);
  const filteredPeople = createMemo(() => {
    return query() === ''
      ? rando
      : rando.filter((person) => {
          return person.name.toLowerCase().includes(query().toLowerCase());
        });
  });

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
          <ComboBox>
            <ComboBox.Input
              onInput={(e) => setQuery(e.currentTarget.value)}
              displayValue={(person) => person.name}
            />
            <ComboBox.Options>
              <For each={filteredPeople()}>
                {(person) => (
                  <ComboBox.Option key={person.id} value={person}>
                    {person.name}
                  </ComboBox.Option>
                )}
              </For>
            </ComboBox.Options>
          </ComboBox>
        </div>
      </div>

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

          <DoseCalculator
            open={doseOpen()}
            onClose={() => setDoseOpen(false)}
            setAutocompleteValues={({ liquidDose, totalLiquid, unit }) => {
              console.log(liquidDose, totalLiquid, unit);
            }}
          />
        </div>
      </div>
    </Client>
  );
};

export default App;
