import { For, createMemo, createSignal, createEffect } from 'solid-js';
import PharmacySearch from '../src/systems/PharmacySearch';
import DoseCalculator from '../src/systems/DoseCalculator';
import Client from '../src/systems/Client';
import Button from '../src/particles/Button';
import Icon from '../src/particles/Icon';
import { randomNames } from '../src/sampleData/randomNames';
import ComboBox from '../src/particles/ComboBox';
import PharmacySelect from '../src/systems/PharmacySelect';
import Card from '../src/particles/Card';

const App = () => {
  const [setPharmacy] = createSignal<any>();
  const [doseOpen, setDoseOpen] = createSignal(false);
  const [query, setQuery] = createSignal('');
  const [patientIds, setPatientIds] = createSignal<string[]>([]);
  const rando = randomNames.slice(0, 3);
  const filteredPeople = createMemo(() => {
    return query() === ''
      ? rando
      : rando.filter((person) => {
          return person.name.toLowerCase().includes(query().toLowerCase());
        });
  });

  createEffect(() => {
    setTimeout(() => {
      setPatientIds(['pat_01H28NXFX27PSADPYPR5JHTCD7']);
    }, 2000);
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

        <h2>Pharmacy Select</h2>
        <Card>
          <PharmacySelect
            patientIds={patientIds()}
            displayLocalPickup
            displaySendToPatient
            setFufillmentType={(t) => console.log('fulfillmentType: ', t)}
            setPharmacyId={(p) => console.log('pharmacyId: ', p)}
          />
        </Card>
        <h4 class="mt-8">With Mail Order</h4>
        <Card>
          <PharmacySelect
            patientIds={['pat_01H28NXFX27PSADPYPR5JHTCD7']}
            displayLocalPickup
            displaySendToPatient
            mailOrderPharmacyIds={[
              'phr_01GA9HPVBVJ0E65P819FD881N0',
              'phr_01GCA54GVKA06C905DETQ9SY98'
            ]}
            setPharmacyId={(p) => console.log('pharmacyId! ', p)}
            setFufillmentType={(t) => console.log('fulfillmentType! ', t)}
          />
        </Card>
      </Client>
    </div>
  );
};

export default App;
