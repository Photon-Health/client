import { types } from '@photonhealth/sdk';
import { createMemo, createSignal, For, onMount } from 'solid-js';
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
  displaySendToPatient?: boolean; // declaritively displays Send to Patient tab
  displayLocalPickup?: boolean; // declaritively displays Local Pickup tab
  mailOrderPharmacyIds?: string[]; // implicitly displays Mail Order tab
  patientIds?: string[];
  address?: string;
  setFufillmentType: (type: types.FulfillmentType | undefined) => void;
  setPharmacyId: (id: string | undefined) => void;
  setPatientId?: (id: string | undefined) => void;
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
  // determine which tabs to display based on props
  // (can safely ignore ESLINT errors as they represent initial values that won't change)
  const tabs = fulfillmentOptions
    .filter((option) => {
      switch (option.fulfillmentType) {
        case SendToPatientEnum.sendToPatient:
          return props.displaySendToPatient !== undefined;
        case types.FulfillmentType.PickUp:
          return props.displayLocalPickup === true;
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

  return (
    <div>
      <Tabs
        tabs={tabs}
        activeTab={tab()}
        setActiveTab={(newTab: string) => {
          setTab(newTab);
          const type = fulfillmentOptions.find((option) => option.name === newTab)?.fulfillmentType;

          // @ts-ignore
          // TODO fix this typing
          props.setFufillmentType(parseFulfillmentType(type));
        }}
      />

      <div class="pt-4">
        {tab() === 'Send to Patient' && (
          <>
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
          </>
        )}

        {tab() === 'Local Pickup' && (
          <PharmacySearch
            setPharmacy={(pharmacy) => {
              props.setPharmacyId(pharmacy.id);
            }}
            address={props?.address || ''}
            patientId={props?.patientIds?.[0]}
          />
        )}

        {tab() === 'Mail Order' && (
          <RadioGroup
            label="Pharmacies"
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
        )}
      </div>
    </div>
  );
}
