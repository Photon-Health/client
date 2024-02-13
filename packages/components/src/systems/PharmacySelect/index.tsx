import { types } from '@photonhealth/sdk';
import { createSignal, For, onMount, Show } from 'solid-js';
import RadioGroupCards from '../../particles/RadioGroupCards';
import Tabs from '../../particles/Tabs';
import PharmacySearch from '../PharmacySearch';
import { MailOrderPharmacy } from './MailOrderPharmacy';
import { SendToPatient } from './SendToPatient';

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
  const [localPharmId, setLocalPharmId] = createSignal<string>();
  const [mailOrderId, setMailOrderId] = createSignal<string>();

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

  const handleTabChange = (newTab: string) => {
    setTab(newTab);
    if (!loadedTabs().includes(newTab)) {
      setLoadedTabs([...loadedTabs(), newTab]);
    }
    const type = fulfillmentOptions.find((option) => option.name === newTab)?.fulfillmentType;
    // @ts-ignore
    props.setFufillmentType(parseFulfillmentType(type));

    // There was a change to not reinitialize each tab body from scratch on tab change.
    // But that creates a problem where the pharmacy id doesn't update if one
    // switches back to a tab the second time. Here we take the persisted pharmacyId
    // if there is one update setPharmacyId
    if (newTab === 'Local Pickup' && localPharmId()) {
      props.setPharmacyId(localPharmId());
    } else if (newTab === 'Mail Order' && mailOrderId()) {
      props.setPharmacyId(mailOrderId());
    } else {
      props.setPharmacyId(undefined);
    }
  };

  return (
    <div>
      <Tabs tabs={tabs} activeTab={tab()} setActiveTab={handleTabChange} />

      <div class="pt-4">
        <Show when={loadedTabs().includes('Send to Patient')}>
          <div class={tab() !== 'Send to Patient' ? 'hidden' : ''}>
            <Show
              when={(props?.patientIds?.length || 0) > 0}
              fallback={<div>Please select a patient.</div>}
            >
              <SendToPatient patientId={props.patientIds![0]} />
            </Show>
          </div>
        </Show>

        <Show when={loadedTabs().includes('Local Pickup')}>
          <div class={tab() !== 'Local Pickup' ? 'hidden' : ''}>
            <PharmacySearch
              address={props?.address || ''}
              patientId={props?.patientIds?.[0]}
              setPharmacy={(pharmacy) => {
                setLocalPharmId(pharmacy.id);
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
            <RadioGroupCards
              label="Pharmacies"
              initSelected={props?.mailOrderPharmacyIds?.[0]}
              setSelected={(pharmacyId) => {
                setMailOrderId(pharmacyId);
                props.setPharmacyId(pharmacyId);
              }}
            >
              <For each={props?.mailOrderPharmacyIds || []}>
                {(id) => (
                  <RadioGroupCards.Option value={id}>
                    <MailOrderPharmacy pharmacyId={id} />
                  </RadioGroupCards.Option>
                )}
              </For>
            </RadioGroupCards>
          </div>
        </Show>
      </div>
    </div>
  );
}
