import { types } from '@photonhealth/sdk';
import { createEffect, createSignal, For, onMount, Show, untrack } from 'solid-js';
import RadioGroupCards from '../../particles/RadioGroupCards';
import Tabs from '../../particles/Tabs';
import PharmacySearch from '../PharmacySearch';
import { MailOrderPharmacy } from './MailOrderPharmacy';
import { SendToPatient } from './SendToPatient';
import { usePrescribe } from '../PrescribeProvider';

enum SendToPatientEnum {
  sendToPatient = 'SEND_TO_PATIENT'
}

export enum TabNamesEnum {
  sendToPatient = 'Send to Patient',
  localPickup = 'Local Pickup',
  mailOrder = 'Mail Order'
}

export type FulfillmentType = types.FulfillmentType | SendToPatientEnum;

export type FulfillmentOption = {
  name: TabNamesEnum;
  fulfillmentType: FulfillmentType;
};

export type FulfillmentOptions = FulfillmentOption[];

interface PharmacySelectProps {
  enableSendToPatient?: boolean; // declaritively displays Send to Patient tab
  enableLocalPickup?: boolean; // declaritively displays Local Pickup tab
  enableDeliveryPharmacies?: boolean; // declaritively displays Mail Order tab
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
    name: TabNamesEnum.sendToPatient,
    fulfillmentType: SendToPatientEnum.sendToPatient
  },
  {
    name: TabNamesEnum.localPickup,
    fulfillmentType: types.FulfillmentType.PickUp
  },
  {
    name: TabNamesEnum.mailOrder,
    fulfillmentType: types.FulfillmentType.MailOrder
  }
];
// if SEND_TO_PATIENT, fulfillment type is returned as undefined
const parseFulfillmentType = (type: FulfillmentType | undefined) => {
  return type === 'SEND_TO_PATIENT' ? undefined : type;
};

export function PharmacySelect(props: PharmacySelectProps) {
  const { orderFormData, selectedCoverageOption } = usePrescribe();

  const [localPharmId, setLocalPharmId] = createSignal<string | undefined>();
  const [mailOrderId, setMailOrderId] = createSignal<string | undefined>();
  const [tabs, setTabs] = createSignal<TabNamesEnum[]>([]);
  const [activeTab, setActiveTab] = createSignal<TabNamesEnum>(TabNamesEnum.sendToPatient);

  onMount(() => {
    // add the tabs to tabs
    setTabs([
      ...(props.enableSendToPatient ? [TabNamesEnum.sendToPatient] : []),
      ...(props.enableLocalPickup ? [TabNamesEnum.localPickup] : []),
      ...(props.enableDeliveryPharmacies && props.mailOrderPharmacyIds
        ? [TabNamesEnum.mailOrder]
        : [])
    ]);

    // Fulfillment option from the first tab name
    const firstOption = fulfillmentOptions.find(
      (option) => option.name === tabs()[0]
    )?.fulfillmentType;

    // Sets the initial fulfillment type to the first available tab
    props.setFufillmentType(parseFulfillmentType(firstOption));
    setActiveTab(tabs()[0]);
  });

  createEffect(() => {
    // when coverage option is selected, navigate to Send to Patient
    const coverageOption = selectedCoverageOption();
    // untrack b/c we only want to change the tab on coverage selection, not on orderFormData changes
    const untrackedId = untrack(() => orderFormData.pharmacyId);
    if (coverageOption && untrackedId === coverageOption.pharmacy.id) {
      setActiveTab(tabs()[0]);
    }
  });

  const handleTabChange = (newTab: TabNamesEnum) => {
    setActiveTab(newTab);

    if (!tabs().includes(newTab)) {
      setTabs([...tabs(), newTab]);
    }

    const type = fulfillmentOptions.find((option) => option.name === newTab)?.fulfillmentType;
    props.setFufillmentType(parseFulfillmentType(type));

    // Preserve the selected pharmacy ID for Local Pickup and Mail Order tabs
    if (newTab === TabNamesEnum.localPickup && localPharmId()) {
      props.setPharmacyId(localPharmId());
    } else if (newTab === TabNamesEnum.mailOrder && mailOrderId()) {
      props.setPharmacyId(mailOrderId());
    } else {
      // Use the selectedCoverageOption's pharmacy, if available, for Send To Patient flow.
      // This is a bit strange - doing this for our first version of RTBC feature.
      // But we dont yet have a better way to show the Provider what pharmacy they selected by selecting a Coverage Option
      props.setPharmacyId(selectedCoverageOption()?.pharmacy.id);
    }
  };

  return (
    <div>
      <Tabs<TabNamesEnum> tabs={tabs()} activeTab={activeTab()} setActiveTab={handleTabChange} />
      <div class="pt-4">
        <Show when={tabs().includes(TabNamesEnum.sendToPatient)}>
          <div class={activeTab() !== TabNamesEnum.sendToPatient ? 'hidden' : ''}>
            <Show
              when={(props?.patientIds?.length || 0) > 0}
              fallback={<div>Please select a patient.</div>}
            >
              <SendToPatient patientId={props.patientIds![0]} />
            </Show>
          </div>
        </Show>

        <Show when={tabs().includes(TabNamesEnum.localPickup)}>
          <div class={activeTab() !== TabNamesEnum.localPickup ? 'hidden' : ''}>
            <PharmacySearch
              address={props?.address || ''}
              patientId={props?.patientIds?.[0]}
              setPharmacy={(pharmacy) => {
                setLocalPharmId(pharmacy.id);
                if (activeTab() === TabNamesEnum.localPickup) {
                  props.setPharmacyId(pharmacy.id);
                }
              }}
              setPreferred={(shouldSetPreferred) =>
                props?.setPreferredPharmacy?.(shouldSetPreferred)
              }
            />
          </div>
        </Show>

        <Show when={tabs().includes(TabNamesEnum.mailOrder)}>
          <div class={activeTab() !== TabNamesEnum.mailOrder ? 'hidden' : ''}>
            <RadioGroupCards
              label="Pharmacies"
              initSelected={props?.mailOrderPharmacyIds?.[0]}
              setSelected={(pharmacyId) => {
                setMailOrderId(pharmacyId);
                if (activeTab() === TabNamesEnum.mailOrder) {
                  props.setPharmacyId(pharmacyId);
                }
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
