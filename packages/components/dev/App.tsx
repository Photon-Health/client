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
          <h2>Address Form</h2>
          <AddressForm patientId="pat_01HAW8GT14ZTJRBADVEY68NQKK" />
        </div>

        <div class="mb-10">
          <h2>Patient Info</h2>
          <PatientInfo patientId="pat_01JEVF5DWQAQFHTVYK9ABG65JZ" />
        </div>

        <div class="mb-10">
          <h2>Patient Med History</h2>
          <PatientMedHistory
            patientId="pat_01JEVF5DWQAQFHTVYK9ABG65JZ"
            enableLinks={false}
            enableRefillButton={true}
          />
        </div>

        <div class="mb-10">
          <h2>Draft Prescriptions</h2>
          <DraftPrescriptions
            draftPrescriptions={draftPrescriptions}
            setDraftPrescriptions={setDraftPrescriptions}
            screeningAlerts={[]}
          />
          <h2>Fetching Draft Presciptions</h2>
          <DraftPrescriptions
            draftPrescriptions={draftPrescriptionsFromTemplates()}
            setDraftPrescriptions={setDraftPrescriptions}
            screeningAlerts={[]}
            templateIds={[
              'tmp_01H5JXWKYFMYT70RND1CGQCFKZ',
              'tmp_01H5JB37PPK9F64RE3QQ52WD7M',
              'tmp_01GQJDV39GPEJ03BATZV1X0SRJ'
            ]}
            prescriptionIds={['rx_01H82MN6S6FN9PN0K7FTKGWC60', 'rx_01H82RKH4K1RA4RS2VG4H8J8XG']}
          />
        </div>

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
            <h2>Pharmacy Search Initialized with Address</h2>
            <PharmacySearch setPharmacy={setPharmacy} address="11221" />
            <h2>Pharmacy Search set with Address after 2 seconds</h2>
            <PharmacySearch setPharmacy={setPharmacy} address={timedAddress()} />
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
            enableLocalPickup
            enableSendToPatient
            setFufillmentType={(t) => console.log('fulfillmentType: ', t)}
            setPharmacyId={(p) => console.log('pharmacyId: ', p)}
          />
        </Card>
        <h4 class="mt-8">With Mail Order</h4>
        <Card>
          <PharmacySelect
            patientIds={['pat_01JEVF5DWQAQFHTVYK9ABG65JZ']}
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

        <h2>Toast</h2>
        <Button
          onClick={() =>
            triggerToast({
              status: 'success',
              header: 'What a great job',
              body: 'This is the body of the toast, glad you are here. And it is a little bit longer and should wrap around the card.'
            })
          }
        >
          Success Toast
        </Button>
        <Button
          onClick={() =>
            triggerToast({
              status: 'info',
              header: 'Serving up some info',
              body: 'This is the body of the toast'
            })
          }
        >
          Info Toast
        </Button>
      </Client>
    </div>
  );
};

export default App;
