import { createEffect, createMemo, createSignal, For } from 'solid-js';
import Client from '../src/systems/Client';
import {
  DraftPrescriptionList,
  DraftPrescriptionsProvider,
  PharmacySelect,
  PharmacySelectionProvider,
  PrescribeEventDispatchProvider,
  PrescribeProvider,
  RecentOrders,
  triggerToast,
  useDraftPrescriptions
} from '../src';
import PickupPharmacySearch from '../src/systems/PharmacySearch';
import DoseCalculator from '../src/systems/DoseCalculator';
import Button from '../src/particles/Button';
import Icon from '../src/particles/Icon';
import { randomNames } from '../src/sampleData/randomNames';
import ComboBox from '../src/particles/ComboBox';
import Card from '../src/particles/Card';
import PatientMedHistory from '../src/systems/PatientMedHistory';
import AddressForm from '../src/systems/AddressForm';
import { Prescription } from '@photonhealth/sdk/dist/types';

// todo: fix this. it broke since we change how draft prescriptions work, and refactored logic into useContexts
const App = () => {
  const [prescriptionIds, setPrescriptionIds] = createSignal<string[]>([
    'rx_01JQF5SG4G6WSMWFR3769PFR8E',
    'rx_01JQF5G1HKVB0XAZYNSTK4V97J'
  ]);

  const { setDraftPrescriptions } = useDraftPrescriptions();
  setDraftPrescriptions(draftPrescriptions);
  const patientId = 'pat_01H28NXFX27PSADPYPR5JHTCD7';
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
  const [selectedPerson, setSelectedPerson] = createSignal<
    { id: string; name: string } | undefined
  >();

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
          <h2>Patient Med History</h2>
          <PatientMedHistory
            patientId="pat_01JEVF5DWQAQFHTVYK9ABG65JZ"
            enableLinks={false}
            enableRefillButton={true}
          />
        </div>
        <PrescribeEventDispatchProvider>
          <RecentOrders patientId={patientId}>
            <DraftPrescriptionsProvider
              patientId={patientId}
              templateIdsPrefill={[]}
              templateOverrides={{}}
              prescriptionIdsPrefill={prescriptionIds()}
              enableCombineAndDuplicate={true}
            >
              <PharmacySelectionProvider>
                <PrescribeProvider patientId={patientId} enableCoverageCheck={true}>
                  <div class="mb-10">
                    <h2>Draft Prescriptions</h2>
                  </div>
                  <DraftPrescriptionList
                    handleDelete={(id) =>
                      setPrescriptionIds(prescriptionIds().filter((p) => p !== id))
                    }
                    handleEdit={(rx) =>
                      setPrescriptionIds(prescriptionIds().filter((p) => p !== rx.id))
                    }
                    handleSwapToOtherPrescription={(_) => _}
                    screeningAlerts={[]}
                    routingConstraints={[]}
                  />
                </PrescribeProvider>
              </PharmacySelectionProvider>
            </DraftPrescriptionsProvider>
          </RecentOrders>
        </PrescribeEventDispatchProvider>

        <div class="mb-10">
          <div>
            <h2>ComboBox</h2>

            <ComboBox value={selectedPerson()} setSelected={setSelectedPerson}>
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
            <PickupPharmacySearch setPharmacy={setPharmacy} />
            <h2>Pharmacy Search Initialized with Address</h2>
            <PickupPharmacySearch setPharmacy={setPharmacy} address="11221" />
            <h2>Pharmacy Search set with Address after 2 seconds</h2>
            <PickupPharmacySearch setPharmacy={setPharmacy} address={timedAddress()} />
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
        <PharmacySelectionProvider enableLocalPickup enableSendToPatient>
          <Card>
            <PharmacySelect patientIds={patientIds()} />
          </Card>
        </PharmacySelectionProvider>
        <h4 class="mt-8">With Mail Order</h4>
        <PharmacySelectionProvider
          enableLocalPickup
          enableSendToPatient
          mailOrderIds="phr_01GA9HPVBVJ0E65P819FD881N0,phr_01GCA54GVKA06C905DETQ9SY98"
        >
          <Card>
            <PharmacySelect patientIds={['pat_01JEVF5DWQAQFHTVYK9ABG65JZ']} address="11221" />
          </Card>
        </PharmacySelectionProvider>

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

const draftPrescriptions: Prescription[] = [
  {
    id: '1',
    effectiveDate: '2021-01-01',
    treatment: {
      name: 'Metroprolol 50mg',
      id: 'treatmentId'
    },
    dispenseAsWritten: false,
    dispenseQuantity: 1,
    dispenseUnit: 'dispenseUnit',
    daysSupply: 1,
    instructions: 'instructions',
    notes: 'notes',
    fillsAllowed: 1
  } as Prescription,
  {
    id: '2',
    effectiveDate: '2021-01-01',
    treatment: {
      name: 'Metroprolol 50mg',
      id: 'treatmentId'
    },
    dispenseAsWritten: false,
    dispenseQuantity: 1,
    dispenseUnit: 'dispenseUnit',
    daysSupply: 1,
    instructions: 'Here are some much longer instructions that will wrap around the card.',
    notes: 'notes',
    fillsAllowed: 1
  } as Prescription
];
