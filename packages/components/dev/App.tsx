import { For, createMemo, createSignal, createEffect } from 'solid-js';
import PatientInfo from '../src/systems/PatientInfo';
import PharmacySearch from '../src/systems/PharmacySearch';
import DoseCalculator from '../src/systems/DoseCalculator';
import Client from '../src/systems/Client';
import Button from '../src/particles/Button';
import Icon from '../src/particles/Icon';
import { randomNames } from '../src/sampleData/randomNames';
import ComboBox from '../src/particles/ComboBox';
import { PharmacySelect } from '../src/systems/PharmacySelect';
import Card from '../src/particles/Card';
import DraftPrescriptions, { DraftPrescription } from '../src/systems/DraftPrescriptions';
import PatientMedHistory from '../src/systems/PatientMedHistory';
import { triggerToast } from '../src';
import AddressForm from '../src/systems/AddressForm';

const draftPrescriptions: DraftPrescription[] = [
  {
    name: 'Metropolol Draft',
    isPrivate: false,
    id: '1',
    effectiveDate: '2021-01-01',
    treatment: {
      name: 'Metroprolol 50mg',
      id: 'treatmentId',
      codes: {
        rxcui: 'String',
        productNDC: 'String',
        packageNDC: 'String',
        SKU: 'String',
        HCPCS: 'String'
      }
    },
    dispenseAsWritten: false,
    dispenseQuantity: 1,
    dispenseUnit: 'dispenseUnit',
    daysSupply: 1,
    refillsInput: 1,
    instructions: 'instructions',
    notes: 'notes',
    fillsAllowed: 1,
    addToTemplates: false,
    catalogId: 'catalogId'
  },
  {
    name: 'Metropolol Draft 2',
    isPrivate: false,
    id: '2',
    effectiveDate: '2021-01-01',
    treatment: {
      name: 'Metroprolol 50mg',
      id: 'treatmentId',
      codes: {
        rxcui: 'String',
        productNDC: 'String',
        packageNDC: 'String',
        SKU: 'String',
        HCPCS: 'String'
      }
    },
    dispenseAsWritten: false,
    dispenseQuantity: 1,
    dispenseUnit: 'dispenseUnit',
    daysSupply: 1,
    refillsInput: 1,
    instructions: 'Here are some much longer instructions that will wrap around the card.',
    notes: 'notes',
    fillsAllowed: 1,
    addToTemplates: false,
    catalogId: 'catalogId'
  }
];

const App = () => {
  const [setPharmacy] = createSignal<any>();
  const [doseOpen, setDoseOpen] = createSignal(false);
  const [query, setQuery] = createSignal('');
  const [patientIds, setPatientIds] = createSignal<string[]>([]);
  const [timedAddress, setTimedAddress] = createSignal<string>('');
  const [draftPrescriptionsFromTemplates, setDraftPrescriptions] = createSignal<
    DraftPrescription[]
  >([]);
  const rando = randomNames.slice(0, 3);
  const filteredPeople = createMemo(() => {
    return query() === ''
      ? rando
      : rando.filter((person) => {
          return person.name.toLowerCase().includes(query().toLowerCase());
        });
  });

  const [prescriptionIds, setPrescriptionIds] = createSignal<string[]>([
    'rx_01JQF5SG4G6WSMWFR3769PFR8E',
    'rx_01JQF5G1HKVB0XAZYNSTK4V97J'
  ]);

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
        <div class="mb-10">
          <h2>Draft Prescriptions</h2>
          <DraftPrescriptions
            setDraftPrescriptions={setDraftPrescriptions}
            handleDelete={(id) => setPrescriptionIds(prescriptionIds().filter((p) => p !== id))}
            handleEdit={(id) => setPrescriptionIds(prescriptionIds().filter((p) => p !== id))}
            screeningAlerts={[]}
            prescriptionIds={prescriptionIds()}
          />
        </div>
      </Client>
    </div>
  );
};

export default App;
