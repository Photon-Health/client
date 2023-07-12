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
  const [timedAddress, setTimedAddress] = createSignal<string>('');

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
      setTimedAddress('Bellville, Texas');
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
        <Card>
          <PharmacySelect
            patientIds={['pat_01GQ0XFBHSH3YXN936A2D2SD7Y']}
            enableLocalPickup
            enableSendToPatient
            mailOrderPharmacyIds={[
              'phr_01GA9HPVBVJ0E65P819FD881N0',
              'phr_01GCA54GVKA06C905DETQ9SY98'
            ]}
            address="11221"
            setPharmacyId={(p) => console.log('pharmacyId! ', p)}
            setFufillmentType={(t) => console.log('fulfillmentType! ', t)}
          />
        </Card>
      </Client>
    </div>
  );
};

export default App;
