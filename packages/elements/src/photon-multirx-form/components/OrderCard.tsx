import { createMemo } from 'solid-js';
import { PharmacySelect } from '@photonhealth/components';
import { Card, Text } from '@photonhealth/components';
import photonStyles from '@photonhealth/components/dist/style.css?inline';
import { PrescribeFormStoreWrapper } from '../../stores/prescribeForm';
export const OrderCard = (props: {
  store: PrescribeFormStoreWrapper['store'];
  actions: PrescribeFormStoreWrapper['actions'];
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
    <div>
      <style>{photonStyles}</style>
      <Card addChildrenDivider={true}>
        <div class="flex items-center justify-between">
          <Text color="gray">Select Pharmacy</Text>
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
      </Card>
    </div>
  );
};
