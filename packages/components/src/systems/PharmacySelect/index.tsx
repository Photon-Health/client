import { types } from '@photonhealth/sdk';
import { createMemo, createSignal, For, onMount, Show } from 'solid-js';
import RadioGroup from '../../particles/RadioGroup';
import Tabs from '../../particles/Tabs';
import PharmacySearch from '../PharmacySearch';
import { MailOrderPharmacy } from './MailOrderPharmacy';
import { PatientDetails } from './PatientDetails';

enum SendToPatientEnum {
  sendToPatient = 'SEND_TO_PATIENT'
}

export type FulfillmentType = types.FulfillmentType | SendToPatientEnum;

export type FulfillmentOptions = {
  name: string;
  fulfillmentType: FulfillmentType;
}[];

interface PharmacySelectProps {
  enableSendToPatient?: boolean; // declaritively displays Send to Patient tab
  enableLocalPickup?: boolean; // declaritively displays Local Pickup tab
  mailOrderPharmacyIds?: string[]; // implicitly displays Mail Order tab
  patientIds?: string[];
  address?: string;
  setFufillmentType: (type: types.FulfillmentType | undefined) => void;
  setPharmacyId: (id: string | undefined) => void;
  setPatientId?: (id: string | undefined) => void;
  setPreferredPharmacy?: (shouldSet: boolean) => void;
}

const fulfillmentOptions: FulfillmentOptions = [
  {
    name: 'Send to Patient',
    fulfillmentType: SendToPatientEnum.sendToPatient
  },
  {
    name: 'Local Pickup',
    fulfillmentType: types.FulfillmentType.PickUp
  },
  {
    name: 'Mail Order',
    fulfillmentType: types.FulfillmentType.MailOrder
  }
];

// if SEND_TO_PATIENT, fulfillment type is returned as undefined
const parseFulfillmentType = (type: FulfillmentType) => {
  return type === 'SEND_TO_PATIENT' ? undefined : type;
};

export default function PharmacySelect(props: PharmacySelectProps) {
  const [loadedTabs, setLoadedTabs] = createSignal<string[]>(['Send to Patient']);

  // determine which tabs to display based on props
  // (can safely ignore ESLINT errors as they represent initial values that won't change)
  const tabs = fulfillmentOptions
    .filter((option) => {
      switch (option.fulfillmentType) {
        case SendToPatientEnum.sendToPatient:
          return props.enableSendToPatient === true;
        case types.FulfillmentType.PickUp:
          return props.enableLocalPickup === true;
        case types.FulfillmentType.MailOrder:
          return props.mailOrderPharmacyIds !== undefined;
        default:
          return false;
      }
    })
    .map((option) => option.name);
  const [tab, setTab] = createSignal(tabs[0]);

  onMount(() => {
    // sets the initial fulfillment type to 'Send to Patient'
    props.setFufillmentType(parseFulfillmentType(fulfillmentOptions[0].fulfillmentType));
  });

  const patientCount = createMemo(() => props?.patientIds?.length || 0);

  const handleTabChange = (newTab: string) => {
    setTab(newTab);
    if (!loadedTabs().includes(newTab)) {
      setLoadedTabs([...loadedTabs(), newTab]);
    }
    const type = fulfillmentOptions.find((option) => option.name === newTab)?.fulfillmentType;
    // @ts-ignore
    props.setFufillmentType(parseFulfillmentType(type));
  };

  return (
    <div>
      <Tabs tabs={tabs} activeTab={tab()} setActiveTab={handleTabChange} />

      <div class="pt-4">
        <Show when={loadedTabs().includes('Send to Patient')}>
          <div class={tab() !== 'Send to Patient' ? 'hidden' : ''}>
            {patientCount() > 0 && (
              <RadioGroup
                label="Patients"
                initSelected={props?.patientIds?.[0]}
                setSelected={(patientId) => {
                  // for now, there is only one patient, but in the future we
                  // might want to support selecting between multiple patients
                  if (props.setPatientId) {
                    props.setPatientId(patientId);
                  }
                  if (props.setPharmacyId) {
                    props.setPharmacyId(undefined);
                  }
                }}
              >
                <For each={props?.patientIds || []}>
                  {(id) => (
                    <RadioGroup.Option value={id}>
                      <PatientDetails patientId={id} />
                    </RadioGroup.Option>
                  )}
                </For>
              </RadioGroup>
            )}
            {patientCount() === 0 && <div>Please add a patient.</div>}
          </div>
        </Show>

        <Show when={loadedTabs().includes('Local Pickup')}>
          <div class={tab() !== 'Local Pickup' ? 'hidden' : ''}>
            <PharmacySearch
              address={props?.address || ''}
              patientId={props?.patientIds?.[0]}
              setPharmacy={(pharmacy) => {
                props.setPharmacyId(pharmacy.id);
              }}
              setPreferred={(shouldSetPreferred) =>
                props?.setPreferredPharmacy?.(shouldSetPreferred)
              }
            />
          </div>
        </Show>

        <Show when={loadedTabs().includes('Mail Order')}>
          <div class={tab() !== 'Mail Order' ? 'hidden' : ''}>
            <RadioGroup
              label="Pharmacies"
              initSelected={props?.mailOrderPharmacyIds?.[0]}
              setSelected={(pharmacyId) => props.setPharmacyId(pharmacyId)}
            >
              <For each={props?.mailOrderPharmacyIds || []}>
                {(id) => (
                  <RadioGroup.Option value={id}>
                    <MailOrderPharmacy pharmacyId={id} />
                  </RadioGroup.Option>
                )}
              </For>
            </RadioGroup>
          </div>
        </Show>
      </div>
    </div>
  );
}
