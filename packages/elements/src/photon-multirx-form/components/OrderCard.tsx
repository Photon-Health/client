import { createMemo } from 'solid-js';
import { PharmacySelect } from '@photonhealth/components';

export const OrderCard = (props: {
  store: Record<string, any>;
  actions: Record<string, (...args: any) => any>;
  enableLocalPickup: boolean;
  enableSendToPatient: boolean;
  mailOrderIds?: string;
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
        enableSendToPatient={props.enableSendToPatient}
        // Defaults to Local Pickup if nothing is set
        enableLocalPickup={
          props.enableLocalPickup || (!props?.enableSendToPatient && !props?.mailOrderIds)
        }
        mailOrderPharmacyIds={props.mailOrderIds ? props.mailOrderIds.split(',') : undefined}
        patientIds={patientIds()}
        address={address()}
        setFufillmentType={(type: string | undefined) => {
          props.actions.updateFormValue({
            key: 'fulfillmentType',
            value: type || ''
          });
        }}
        setPreferredPharmacy={(shouldSet = false) => {
          props.actions.updateFormValue({
            key: 'updatePreferredPharmacy',
            value: shouldSet
          });
        }}
        setPharmacyId={(id: string | undefined) => {
          // TODO need to fix types coming from components, shouldn't have to do the above
          props.actions.updateFormValue({
            key: 'pharmacy',
            value: id
          });
        }}
      />
    </photon-card>
  );
};
