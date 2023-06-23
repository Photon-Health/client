import { types } from '@photonhealth/sdk';
import { createMemo, createSignal, For, onMount } from 'solid-js';
import Card from '../../particles/Card';
import RadioGroup from '../../particles/RadioGroup';
import Tabs from '../../particles/Tabs';
import PharmacySearch from '../PharmacySearch';
import { MailOrderPharmacy } from './MailOrderPharmacy';
import { PatientDetails } from './PatientDetails';

interface PharmacySelectProps {
  mailOrderPharmacyIds?: string[];
  patientIds?: string[];
  setFufillmentType: (type: types.FulfillmentType | undefined) => void;
  setPharmacyId: (id: string | undefined) => void;
}

export type FulfillmentOptions = {
  name: string;
  fulfillmentType: types.FulfillmentType | undefined;
}[];

const fulfillmentOptions: FulfillmentOptions = [
  {
    name: 'Send to Patient',
    fulfillmentType: undefined
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

export default function PharmacySelect(props: PharmacySelectProps) {
  const tabs = fulfillmentOptions.map((option) => option.name);
  const [tab, setTab] = createSignal(tabs[0]);
  const hasMailOrder = createMemo(() => (props?.mailOrderPharmacyIds?.length || 0) > 0);

  onMount(() => {
    // sets the initial fulfillment type to 'Send to Patient'
    props.setFufillmentType(fulfillmentOptions[0].fulfillmentType);
  });

  return (
    <Card>
      <div>
        <Tabs
          tabs={hasMailOrder() ? tabs : tabs.slice(0, -1)}
          activeTab={tab()}
          setActiveTab={(newTab: string) => {
            setTab(newTab);
            props.setFufillmentType(
              fulfillmentOptions.find((option) => option.name === newTab)?.fulfillmentType
            );
          }}
        />

        <div class="pt-4">
          {tab() === 'Send to Patient' && (
            <RadioGroup
              label="Patients"
              initSelected={props?.patientIds?.[0]}
              setSelected={() => console.log('?')}
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

          {tab() === 'Local Pickup' && (
            <PharmacySearch setPharmacy={(pharmacy) => props.setPharmacyId(pharmacy.id)} />
          )}

          {tab() === 'Mail Order' && (
            <RadioGroup label="Pharmacies" setSelected={() => console.log('?')}>
              <For each={props?.mailOrderPharmacyIds || []}>
                {(id) => (
                  <RadioGroup.Option value={id}>
                    <MailOrderPharmacy pharmacyId={id} />
                  </RadioGroup.Option>
                )}
              </For>
            </RadioGroup>
          )}
        </div>
      </div>
    </Card>
  );
}
