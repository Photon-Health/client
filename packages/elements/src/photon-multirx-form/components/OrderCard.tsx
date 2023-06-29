import { createMemo } from 'solid-js';
import { PharmacySelect } from '@photonhealth/components';

export const OrderCard = (props: {
  store: Record<string, any>;
  actions: Record<string, (...args: any) => any>;
}) => {
  const patientIds = createMemo(() =>
    props.store['patient']?.value ? [props.store['patient']?.value?.id] : []
  );

  const address = createMemo(() => {
    const address = props.store['patient']?.value?.address;
    return address
      ? `${address.street1} ${address.street2 || ''} ${address.city}, ${address.state} ${
          address.postalCode
        }`
      : '';
  });

  return (
    <photon-card>
      <div class="flex flex-row">
        <p class="font-sans text-l font-medium flex-grow">Select Pharmacy</p>
      </div>
      <PharmacySelect
        displaySendToPatient
        displayLocalPickup
        patientIds={patientIds()}
        address={address()}
        setFufillmentType={(type: string | undefined) => {
          props.actions.updateFormValue({
            key: 'fulfillmentType',
            value: type || ''
          });
        }}
        setPharmacyId={(id: string) => {
          props.actions.updateFormValue({
            key: 'pharmacy',
            value: id
          });
        }}
      />
    </photon-card>
  );
};
