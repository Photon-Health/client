import { types } from '@photonhealth/sdk';
import { createMemo, For, Show } from 'solid-js';
import RadioGroupCards, { RadioGroupCardsContextValue } from '../../particles/RadioGroupCards';
import Tabs from '../../particles/Tabs';
import PickupPharmacySearch from '../PharmacySearch';
import { MailOrderPharmacy } from './MailOrderPharmacy';
import { usePharmacySelectionContext } from '../PharmacySelect';
import { PharmacyRoutingAlert } from '../RoutingConstraints';
import { Alert } from '../../particles/Alert';
import { MailOrderPharmacySearch } from '../PharmacySearch/MailOrderPharmacySearch';
import { PharmacyOption } from '../PharmacySearch/PharmacySearch';
import { TabNamesEnum } from './PharmacySelect';

export interface PharmacyTabViewProps {
  tabs: TabNamesEnum[];
  activeTab: TabNamesEnum;
  onTabChange: (tab: TabNamesEnum) => void;
  address?: string;
  patientIds?: string[];
  hasPreferredPharmacy?: boolean;
  mailOrderId?: string;
  mailOrderOption?: PharmacyOption;
  onLocalPharmacySelect: (pharmacy: types.Pharmacy) => void;
  onPreferredChange: (shouldSet: boolean) => void;
  onMailOrderSearchSelect: (pharmacy: PharmacyOption) => void;
  onMailOrderPartnerSelect: (pharmacyId: string) => void;
  radioGroupContextRef: (context: RadioGroupCardsContextValue) => void;
}

export function PharmacyTabView(props: PharmacyTabViewProps) {
  const pharmacySelectionContext = usePharmacySelectionContext();
  const unroutablePharmacyIds = () => pharmacySelectionContext.unroutablePharmacyIds();
  const hasAddress = createMemo(() => Boolean(props.address?.trim()));

  return (
    <div>
      <Tabs<TabNamesEnum>
        tabs={props.tabs}
        activeTab={props.activeTab}
        setActiveTab={props.onTabChange}
      />
      <div class="pt-4">
        <Show when={props.tabs.includes(TabNamesEnum.localPickup)}>
          <div class={props.activeTab !== TabNamesEnum.localPickup ? 'hidden' : ''}>
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
                address={props.address || ''}
                patientId={props.patientIds?.[0]}
                setPharmacy={props.onLocalPharmacySelect}
                setPreferred={props.onPreferredChange}
              />
            </Show>
          </div>
        </Show>

        <Show when={props.tabs.includes(TabNamesEnum.mailOrder)}>
          <div class={props.activeTab !== TabNamesEnum.mailOrder ? 'hidden' : ''}>
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
                  selected={props.mailOrderOption}
                  selectPharmacy={props.onMailOrderSearchSelect}
                />
                {(pharmacySelectionContext.mailOrderPharmacyIds()?.length ?? 0) > 0 && (
                  <div class="space-y-2">
                    <label>Choose a partner pharmacy</label>
                    <RadioGroupCards
                      label="Pharmacies"
                      value={props.mailOrderId}
                      setSelected={props.onMailOrderPartnerSelect}
                      contextRef={props.radioGroupContextRef}
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
