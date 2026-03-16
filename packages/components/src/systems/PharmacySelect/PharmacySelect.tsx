import { types } from '@photonhealth/sdk';
import { createEffect, createMemo, createSignal, For, onMount, Show, untrack } from 'solid-js';
import RadioGroupCards, { RadioGroupCardsContextValue } from '../../particles/RadioGroupCards';
import Tabs from '../../particles/Tabs';
import Icon from '../../particles/Icon';
import PickupPharmacySearch from '../PharmacySearch';
import { MailOrderPharmacy } from './MailOrderPharmacy';
import { usePrescribe } from '../PrescribeProvider';
import { usePharmacySelectionContext } from '../PharmacySelect';
import { usePrescribeEventDispatch } from '../PrescribeEventDispatchProvider';
import { PharmacyRoutingAlert } from '../RoutingConstraints';
import { Alert } from '../../particles/Alert';
import { MailOrderPharmacySearch } from '../PharmacySearch/MailOrderPharmacySearch';
import { PharmacyOption } from '../PharmacySearch/PharmacySearch';
import { PharmacySelectionCard } from './PharmacySelectionCard';

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
  const { dispatchAnalytics } = usePrescribeEventDispatch();
  const hasAddress = createMemo(() => Boolean(props.address?.trim()));

  const [localPharmId, setLocalPharmId] = createSignal<string | undefined>();
  const [localPharmDetails, setLocalPharmDetails] = createSignal<
    { name: string; address?: string } | undefined
  >();
  const [mailOrderId, setMailOrderId] = createSignal<string | undefined>();
  const [mailOrderOption, setMailOrderOption] = createSignal<PharmacyOption | undefined>();

  const [tabs, setTabs] = createSignal<TabNamesEnum[]>([]);
  const [activeTab, setActiveTab] = createSignal<TabNamesEnum>(TabNamesEnum.sendToPatient);

  // New UX state
  const [expanded, setExpanded] = createSignal(false);
  const [providerSelectedPharmacy, setProviderSelectedPharmacy] = createSignal<
    { name: string; address?: string } | undefined
  >();

  // Whether the new UX applies (only when enableSendToPatient is true)
  const useNewUx = createMemo(() => pharmacySelectionContext.enableSendToPatient());

  // Whether there are provider-selectable tabs (Local Pickup or Mail Order)
  const hasProviderTabs = createMemo(
    () =>
      pharmacySelectionContext.enableLocalPickup() ||
      pharmacySelectionContext.enableDeliveryPharmacies()
  );

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
    if (useNewUx()) {
      // New UX: only provider-selectable tabs (no Send to Patient tab)
      const providerTabs = [
        ...(pharmacySelectionContext.enableLocalPickup() ? [TabNamesEnum.localPickup] : []),
        ...(pharmacySelectionContext.enableDeliveryPharmacies() ? [TabNamesEnum.mailOrder] : [])
      ];
      setTabs(providerTabs);
      if (providerTabs.length > 0) {
        setActiveTab(providerTabs[0]);
      }
      // Default fulfillment type is undefined (patient will select)
      pharmacySelectionContext.setFulfillmentType(undefined);
    } else {
      // Legacy UX: tabs as before (without Send to Patient since it's disabled)
      setTabs([
        ...(pharmacySelectionContext.enableLocalPickup() ? [TabNamesEnum.localPickup] : []),
        ...(pharmacySelectionContext.enableDeliveryPharmacies() ? [TabNamesEnum.mailOrder] : [])
      ]);

      const firstOption = fulfillmentOptions.find(
        (option) => option.name === tabs()[0]
      )?.fulfillmentType;
      pharmacySelectionContext.setFulfillmentType(parseFulfillmentType(firstOption));
      setActiveTab(tabs()[0]);
    }
  });

  createEffect(() => {
    // when coverage option is selected, collapse the expanded section in new UX
    const coverageOption = selectedCoverageOption();
    const untrackedId = untrack(() => pharmacySelectionContext.pharmacyId());
    if (coverageOption && untrackedId === coverageOption.pharmacy.id) {
      if (useNewUx()) {
        setExpanded(false);
        setProviderSelectedPharmacy(undefined);
      } else {
        setActiveTab(tabs()[0]);
      }
    }
  });

  const handleTabChange = (newTab: TabNamesEnum) => {
    setActiveTab(newTab);

    if (!tabs().includes(newTab)) {
      setTabs([...tabs(), newTab]);
    }

    const type = fulfillmentOptions.find((option) => option.name === newTab)?.fulfillmentType;
    pharmacySelectionContext.setFulfillmentType(parseFulfillmentType(type));

    dispatchAnalytics({
      trackEventType: 'pharmacy_interaction',
      properties: {
        tabSelected: newTab,
        hasPreferredPharmacy: props.hasPreferredPharmacy ?? false
      }
    });

    // Preserve the selected pharmacy ID for Local Pickup and Mail Order tabs
    if (newTab === TabNamesEnum.localPickup && localPharmId()) {
      pharmacySelectionContext.setPharmacyId(localPharmId());
    } else if (newTab === TabNamesEnum.mailOrder && mailOrderId()) {
      pharmacySelectionContext.setPharmacyId(mailOrderId());
    } else {
      pharmacySelectionContext.setPharmacyId(selectedCoverageOption()?.pharmacy.id);
    }
  };

  const handleProviderPharmacySelect = (pharmacy: {
    id: string;
    name: string;
    address?: string;
  }) => {
    setProviderSelectedPharmacy({ name: pharmacy.name, address: pharmacy.address });
    setExpanded(false);
  };

  const handleLetPatientChoose = () => {
    setProviderSelectedPharmacy(undefined);
    setExpanded(false);
    pharmacySelectionContext.setPharmacyId(undefined);
    pharmacySelectionContext.setFulfillmentType(undefined);
    setLocalPharmId(undefined);
    setLocalPharmDetails(undefined);
    setMailOrderId(undefined);
    setMailOrderOption(undefined);
  };

  const handleToggleExpanded = () => {
    const wasExpanded = expanded();
    setExpanded(!wasExpanded);

    // When collapsing with a local pickup pharmacy selected, show it in the card
    if (wasExpanded && localPharmId() && activeTab() === TabNamesEnum.localPickup) {
      const details = localPharmDetails();
      if (details) {
        setProviderSelectedPharmacy(details);
      }
    }
  };

  const handleChangePharmacy = () => {
    setExpanded(true);
  };

  // New UX layout
  if (useNewUx()) {
    return (
      <div class="space-y-3">
        {/* PharmacySelectionCard — always visible */}
        <Show
          when={(props?.patientIds?.length || 0) > 0}
          fallback={<div>Please select a patient.</div>}
        >
          <PharmacySelectionCard
            patientId={props.patientIds![0]}
            providerSelectedPharmacy={providerSelectedPharmacy()}
            onChangePharmacy={handleChangePharmacy}
            onLetPatientChoose={handleLetPatientChoose}
          />
        </Show>

        {/* Collapsible toggle — only when there are provider-selectable tabs */}
        <Show when={hasProviderTabs()}>
          <button
            class="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 font-medium"
            onClick={handleToggleExpanded}
          >
            Choose a pharmacy yourself
            <Icon name={expanded() ? 'chevronUp' : 'chevronDown'} size="sm" class="text-gray-500" />
          </button>

          {/* Collapsible tab section */}
          <Show when={expanded()}>
            <div>
              <Tabs<TabNamesEnum>
                tabs={tabs()}
                activeTab={activeTab()}
                setActiveTab={handleTabChange}
              />
              <div class="pt-4">
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
                          const addr = pharmacy.address
                            ? `${pharmacy.address.street1 || ''}, ${pharmacy.address.city || ''}, ${
                                pharmacy.address.state || ''
                              }`
                            : undefined;
                          setLocalPharmDetails({ name: pharmacy.name, address: addr });
                          pharmacySelectionContext.setPharmacyId(pharmacy.id);
                          pharmacySelectionContext.setFulfillmentType(types.FulfillmentType.PickUp);
                        }}
                        setPreferred={(shouldSetPreferred) => {
                          pharmacySelectionContext.setUpdatePreferredPharmacy(shouldSetPreferred);
                          dispatchAnalytics({
                            trackEventType: 'pharmacy_interaction',
                            properties: {
                              tabSelected: TabNamesEnum.localPickup,
                              hasPreferredPharmacy: props.hasPreferredPharmacy ?? false,
                              setAsPreferred: shouldSetPreferred
                            }
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
                            pharmacySelectionContext.setPharmacyId(pharmacy.id);
                            pharmacySelectionContext.setFulfillmentType(
                              types.FulfillmentType.MailOrder
                            );
                            const addr = pharmacy.address
                              ? `${pharmacy.address.street1 || ''}, ${
                                  pharmacy.address.city || ''
                                }, ${pharmacy.address.state || ''}`
                              : undefined;
                            handleProviderPharmacySelect({
                              id: pharmacy.id,
                              name: pharmacy.name,
                              address: addr
                            });
                          }}
                        />
                        {(pharmacySelectionContext.mailOrderPharmacyIds()?.length ?? 0) > 0 && (
                          <div class="space-y-2">
                            <label>Choose a partner pharmacy</label>
                            <RadioGroupCards
                              label="Pharmacies"
                              value={mailOrderId()}
                              setSelected={(pharmacyId) => {
                                setMailOrderOption(undefined);
                                setMailOrderId(pharmacyId);
                                pharmacySelectionContext.setPharmacyId(pharmacyId);
                                pharmacySelectionContext.setFulfillmentType(
                                  types.FulfillmentType.MailOrder
                                );
                              }}
                              contextRef={(context) => (radioGroupContext = context)}
                            >
                              <For each={pharmacySelectionContext.mailOrderPharmacyIds() || []}>
                                {(id) => (
                                  <RadioGroupCards.Option
                                    value={id}
                                    disabled={unroutablePharmacyIds().has(id)}
                                    alert={
                                      unroutablePharmacyIds().has(id) && <PharmacyRoutingAlert />
                                    }
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
          </Show>
        </Show>
      </div>
    );
  }

  // Legacy UX (enableSendToPatient is false) — tab-based UI without Send to Patient tab
  return (
    <div>
      <Tabs<TabNamesEnum> tabs={tabs()} activeTab={activeTab()} setActiveTab={handleTabChange} />
      <div class="pt-4">
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
                  if (activeTab() === TabNamesEnum.localPickup) {
                    pharmacySelectionContext.setPharmacyId(pharmacy.id);
                  }
                }}
                setPreferred={(shouldSetPreferred) => {
                  pharmacySelectionContext.setUpdatePreferredPharmacy(shouldSetPreferred);
                  dispatchAnalytics({
                    trackEventType: 'pharmacy_interaction',
                    properties: {
                      tabSelected: TabNamesEnum.localPickup,
                      hasPreferredPharmacy: props.hasPreferredPharmacy ?? false,
                      setAsPreferred: shouldSetPreferred
                    }
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
                    if (activeTab() === TabNamesEnum.mailOrder) {
                      pharmacySelectionContext.setPharmacyId(pharmacy.id);
                    }
                  }}
                />
                {(pharmacySelectionContext.mailOrderPharmacyIds()?.length ?? 0) > 0 && (
                  <div class="space-y-2">
                    <label>Choose a partner pharmacy</label>
                    <RadioGroupCards
                      label="Pharmacies"
                      value={mailOrderId()}
                      setSelected={(pharmacyId) => {
                        setMailOrderOption(undefined);
                        setMailOrderId(pharmacyId);
                        if (activeTab() === TabNamesEnum.mailOrder) {
                          pharmacySelectionContext.setPharmacyId(pharmacyId);
                        }
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
