import { types } from '@photonhealth/sdk';
import { createEffect, createMemo, createSignal, For, onMount, Show, untrack } from 'solid-js';
import RadioGroupCards, { RadioGroupCardsContextValue } from '../../particles/RadioGroupCards';
import Tabs from '../../particles/Tabs';
import PickupPharmacySearch from '../PharmacySearch';
import { MailOrderPharmacy } from './MailOrderPharmacy';
import { SendToPatient } from './SendToPatient';
import { usePrescribe } from '../PrescribeProvider';
import { usePharmacySelectionContext } from '../PharmacySelect';
import { usePrescribeEventDispatch } from '../PrescribeEventDispatchProvider';
import { PharmacyRoutingAlert } from '../RoutingConstraints';
import { Alert } from '../../particles/Alert';
import { MailOrderPharmacySearch } from '../PharmacySearch/MailOrderPharmacySearch';
import { PharmacyOption } from '../PharmacySearch/PharmacySearch';
import clsx from 'clsx';

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
  patientIds?: string[];
  address?: string;
  hasPreferredPharmacy?: boolean;
  inferSendToPatientPharmacy?: boolean;
  stickyTabHeader?: boolean;
  enableSavingPreferredPharmacy?: boolean;
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
  const { selectedCoverageOption } = usePrescribe();
  const pharmacySelectionContext = usePharmacySelectionContext();
  const unroutablePharmacyIds = () => pharmacySelectionContext.unroutablePharmacyIds();
  const { dispatchAnalyticsTrackEvent } = usePrescribeEventDispatch();
  const hasAddress = createMemo(() => Boolean(props.address?.trim()));

  const [localPharmId, setLocalPharmId] = createSignal<string | undefined>();
  const [mailOrderId, setMailOrderId] = createSignal<string | undefined>();
  const [mailOrderOption, setMailOrderOption] = createSignal<PharmacyOption | undefined>();

  const [tabs, setTabs] = createSignal<TabNamesEnum[]>([]);
  const [activeTab, setActiveTab] = createSignal<TabNamesEnum>(TabNamesEnum.sendToPatient);

  const routableMailOrderPharmacyIds = createMemo(() => {
    return pharmacySelectionContext
      .mailOrderPharmacyIds()
      ?.filter((id) => !unroutablePharmacyIds().has(id));
  });

  const initMailOrderPharmacyId = createMemo(() => {
    return routableMailOrderPharmacyIds()?.[0];
  });

  let radioGroupContext: RadioGroupCardsContextValue;
  createEffect(() => {
    const mailOrderIdValue = mailOrderId();
    if (mailOrderIdValue && unroutablePharmacyIds().has(mailOrderIdValue)) {
      radioGroupContext[1].setSelected(initMailOrderPharmacyId() || '');
    }
  });

  onMount(() => {
    const tabOptions = [
      ...(pharmacySelectionContext.enableSendToPatient() ? [TabNamesEnum.sendToPatient] : []),
      ...(pharmacySelectionContext.enableLocalPickup() ? [TabNamesEnum.localPickup] : []),
      ...(pharmacySelectionContext.enableDeliveryPharmacies() ? [TabNamesEnum.mailOrder] : [])
    ];
    // add the tabs to tabs
    setTabs(tabOptions);

    // Fulfillment option from the first tab name
    const firstOption = fulfillmentOptions.find(
      (option) => option.name === tabOptions[0]
    )?.fulfillmentType;

    // Sets the initial fulfillment type to the first available tab
    pharmacySelectionContext.setFulfillmentType(parseFulfillmentType(firstOption));
    setActiveTab(tabOptions[0]);

    dispatchAnalyticsTrackEvent('elementViewed', {
      name: 'Pharmacy Select Element Viewed',
      tabs: tabOptions,
      initialTabSelected: tabOptions[0],
      hasPreferredPharmacy: props.hasPreferredPharmacy || false,
      enableSavingPreferredPharmacy: props.enableSavingPreferredPharmacy || false
    });
  });

  createEffect(() => {
    // when coverage option is selected, navigate to Send to Patient
    const coverageOption = selectedCoverageOption();
    // untrack b/c we only want to change the tab on coverage selection, not on pharmacyId changes
    const untrackedId = untrack(() => pharmacySelectionContext.pharmacyId());
    if (coverageOption && untrackedId === coverageOption.pharmacy.id) {
      setActiveTab(tabs()[0]);
    }
  });

  const handleTabChange = (newTab: TabNamesEnum) => {
    setActiveTab(newTab);

    if (!tabs().includes(newTab)) {
      setTabs([...tabs(), newTab]);
    }

    dispatchAnalyticsTrackEvent('fieldInteraction', {
      name: 'Field Interaction',
      formName: 'select_pharmacy',
      fieldName: 'activeTab',
      value: newTab
    });
  };

  // Propagate selected pharmacy back to pharmacySelectionContext
  // based on changes in activeTab or pharmacy Ids
  createEffect(() => {
    const type = fulfillmentOptions.find((option) => option.name === activeTab())?.fulfillmentType;
    pharmacySelectionContext.setFulfillmentType(parseFulfillmentType(type));

    if (activeTab() === TabNamesEnum.localPickup) {
      pharmacySelectionContext.setPharmacyId(localPharmId());
      return;
    }

    if (activeTab() === TabNamesEnum.mailOrder) {
      pharmacySelectionContext.setPharmacyId(mailOrderId());
      return;
    }

    // Use the selectedCoverageOption's pharmacy, if available, for Send To Patient flow.
    // This is a bit strange - doing this for our first version of RTBC feature.
    // But we dont yet have a better way to show the Provider what pharmacy they selected by selecting a Coverage Option
    pharmacySelectionContext.setPharmacyId(selectedCoverageOption()?.pharmacy.id || undefined);
  });

  return (
    <div>
      <div class={clsx({ 'sticky top-0 bg-white z-10': props.stickyTabHeader ?? false })}>
        <Tabs<TabNamesEnum> tabs={tabs()} activeTab={activeTab()} setActiveTab={handleTabChange} />
      </div>
      <div class="pt-4">
        <Show when={tabs().includes(TabNamesEnum.sendToPatient)}>
          <div class={activeTab() !== TabNamesEnum.sendToPatient ? 'hidden' : ''}>
            <Show
              when={(props?.patientIds?.length || 0) > 0}
              fallback={<div>Please select a patient.</div>}
            >
              <SendToPatient
                patientId={props.patientIds![0]}
                inferSendToPatientPharmacy={props.inferSendToPatientPharmacy}
              />
            </Show>
          </div>
        </Show>

        <Show when={tabs().includes(TabNamesEnum.localPickup)}>
          <div class={activeTab() !== TabNamesEnum.localPickup ? 'hidden' : ''}>
            <Show
              when={hasAddress()}
              fallback={
                <Alert
                  type="warning"
                  header="Address required"
                  message="Please add a patient address to select a pharmacy."
                />
              }
            >
              <PickupPharmacySearch
                address={props?.address || ''}
                patientId={props?.patientIds?.[0]}
                setPharmacy={(pharmacy) => {
                  setLocalPharmId(pharmacy.id);
                  dispatchAnalyticsTrackEvent('fieldInteraction', {
                    name: 'Field Interaction',
                    formName: 'select_pharmacy',
                    fieldName: 'pharmacyId',
                    value: pharmacy.id
                  });
                }}
                hidePreferred={!(props.enableSavingPreferredPharmacy ?? true)}
                setPreferred={(shouldSetPreferred) => {
                  pharmacySelectionContext.setUpdatePreferredPharmacy(shouldSetPreferred);
                  dispatchAnalyticsTrackEvent('fieldInteraction', {
                    name: 'Field Interaction',
                    formName: 'select_pharmacy',
                    fieldName: 'setUpdatePreferredPharmacy',
                    value: String(shouldSetPreferred)
                  });
                }}
              />
            </Show>
          </div>
        </Show>

        <Show when={tabs().includes(TabNamesEnum.mailOrder)}>
          <div class={activeTab() !== TabNamesEnum.mailOrder ? 'hidden' : ''}>
            <Show
              when={hasAddress()}
              fallback={
                <Alert
                  type="warning"
                  header="Address required"
                  message="Please add a patient address to select a pharmacy."
                />
              }
            >
              <div class="space-y-4">
                <MailOrderPharmacySearch
                  selected={mailOrderOption()}
                  selectPharmacy={(pharmacy) => {
                    setMailOrderOption(pharmacy);
                    setMailOrderId(pharmacy.id);
                    dispatchAnalyticsTrackEvent('fieldInteraction', {
                      name: 'Field Interaction',
                      formName: 'select_pharmacy',
                      fieldName: 'pharmacyId',
                      value: pharmacy.id
                    });
                  }}
                />
                {(pharmacySelectionContext.mailOrderPharmacyIds()?.length ?? 0) > 0 && (
                  <div class="space-y-2">
                    <label class="text-sm font-medium">Choose a partner pharmacy</label>
                    <RadioGroupCards
                      label="Pharmacies"
                      value={mailOrderId()}
                      setSelected={(pharmacyId) => {
                        setMailOrderOption(undefined);
                        setMailOrderId(pharmacyId);
                        dispatchAnalyticsTrackEvent('fieldInteraction', {
                          name: 'Field Interaction',
                          formName: 'select_pharmacy',
                          fieldName: 'pharmacyId',
                          value: pharmacyId
                        });
                      }}
                      contextRef={(context) => (radioGroupContext = context)}
                    >
                      <For each={pharmacySelectionContext.mailOrderPharmacyIds() || []}>
                        {(id) => (
                          <RadioGroupCards.Option
                            value={id}
                            disabled={unroutablePharmacyIds().has(id)}
                            alert={unroutablePharmacyIds().has(id) && <PharmacyRoutingAlert />}
                          >
                            <MailOrderPharmacy pharmacyId={id} />
                          </RadioGroupCards.Option>
                        )}
                      </For>
                    </RadioGroupCards>
                  </div>
                )}
              </div>
            </Show>
          </div>
        </Show>
      </div>
    </div>
  );
}
