import { createMemo } from 'solid-js';
import { PharmacySelect, usePrescribe } from '@photonhealth/components';
import { Card, Text } from '@photonhealth/components';
import photonStyles from '@photonhealth/components/dist/style.css?inline';

export const OrderCard = (props: {
  store: Record<string, any>;
  actions: Record<string, (...args: any) => any>;
  enableLocalPickup: boolean;
  enableSendToPatient: boolean;
  enableDeliveryPharmacies: boolean;
  mailOrderIds?: string;
}) => {
  const { setOrderFormData } = usePrescribe();
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
          enableDeliveryPharmacies={props.enableDeliveryPharmacies}
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
            setOrderFormData('pharmacyId', id);
          }}
        />
      </Card>
    </div>
  );
};
