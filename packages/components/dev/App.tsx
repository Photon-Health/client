import { createSignal } from 'solid-js';
import Client from '../src/systems/Client';
import {
  DraftPrescriptions,
  DraftPrescriptionsProvider,
  PrescribeProvider,
  RecentOrders
} from '../src';

const App = () => {
  const [prescriptionIds, setPrescriptionIds] = createSignal<string[]>([
    'rx_01JQF5SG4G6WSMWFR3769PFR8E',
    'rx_01JQF5G1HKVB0XAZYNSTK4V97J'
  ]);

  const patientId = 'pat_01H28NXFX27PSADPYPR5JHTCD7';

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
        <DraftPrescriptionsProvider>
          <RecentOrders patientId={patientId}>
            <PrescribeProvider
              templateIdsPrefill={[]}
              templateOverrides={{}}
              prescriptionIdsPrefill={prescriptionIds()}
              patientId={patientId}
              enableCombineAndDuplicate={true}
            >
              <div class="mb-10">
                <h2>Draft Prescriptions</h2>
              </div>
              <DraftPrescriptions
                handleDelete={(id) => setPrescriptionIds(prescriptionIds().filter((p) => p !== id))}
                handleEdit={(rx) =>
                  setPrescriptionIds(prescriptionIds().filter((p) => p !== rx.id))
                }
                screeningAlerts={[]}
              />
            </PrescribeProvider>
          </RecentOrders>
        </DraftPrescriptionsProvider>
      </Client>
    </div>
  );
};

export default App;

// const draftPrescriptions: DraftPrescription[] = [
//   {
//     name: 'Metropolol Draft',
//     isPrivate: false,
//     id: '1',
//     effectiveDate: '2021-01-01',
//     treatment: {
//       name: 'Metroprolol 50mg',
//       id: 'treatmentId',
//       codes: {
//         rxcui: 'String',
//         productNDC: 'String',
//         packageNDC: 'String',
//         SKU: 'String',
//         HCPCS: 'String'
//       }
//     },
//     dispenseAsWritten: false,
//     dispenseQuantity: 1,
//     dispenseUnit: 'dispenseUnit',
//     daysSupply: 1,
//     refillsInput: 1,
//     instructions: 'instructions',
//     notes: 'notes',
//     fillsAllowed: 1,
//     addToTemplates: false,
//     catalogId: 'catalogId'
//   },
//   {
//     name: 'Metropolol Draft 2',
//     isPrivate: false,
//     id: '2',
//     effectiveDate: '2021-01-01',
//     treatment: {
//       name: 'Metroprolol 50mg',
//       id: 'treatmentId',
//       codes: {
//         rxcui: 'String',
//         productNDC: 'String',
//         packageNDC: 'String',
//         SKU: 'String',
//         HCPCS: 'String'
//       }
//     },
//     dispenseAsWritten: false,
//     dispenseQuantity: 1,
//     dispenseUnit: 'dispenseUnit',
//     daysSupply: 1,
//     refillsInput: 1,
//     instructions: 'Here are some much longer instructions that will wrap around the card.',
//     notes: 'notes',
//     fillsAllowed: 1,
//     addToTemplates: false,
//     catalogId: 'catalogId'
//   }
// ];
