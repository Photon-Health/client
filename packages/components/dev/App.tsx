import { For, createMemo, createSignal } from 'solid-js';
import PharmacySearch from '../src/systems/PharmacySearch';
import DoseCalculator from '../src/systems/DoseCalculator';
import Client from '../src/systems/Client';
import Button from '../src/particles/Button';
import Icon from '../src/particles/Icon';
import { randomNames } from '../src/sampleData/randomNames';
import ComboBox from '../src/particles/ComboBox';

const App = () => {
  const [setPharmacy] = createSignal<any>();
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
    <div class="sm:max-w-lg p-4">
      <div>
        <h1>Photon Component Systems</h1>
      </div>
      <Client
        id="7N9QZujlNJHL8EIPqXpu1wq8OuXqoxKb"
        org="org_KzSVZBQixLRkqj5d"
        domain="auth.boson.health"
        audience="https://api.boson.health"
        uri="https://api.boson.health/graphql"
      >
        <div class="mb-10">
          <div>
            <h2>ComboBox</h2>
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

        <div class="mb-10">
          <div>
            <h2>Pharmacy Search</h2>
            <PharmacySearch setPharmacy={setPharmacy} />
          </div>
        </div>

        <div class="mb-10">
          <div>
            <h2>Dose Calculator</h2>
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
    </div>
  );
};

export default App;