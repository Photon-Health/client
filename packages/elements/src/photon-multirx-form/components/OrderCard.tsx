import { createMemo } from 'solid-js';
import {
  Card,
  PharmacySelect,
  Text,
  usePrescribe,
  usePrescribeEventDispatch
} from '@photonhealth/components';
import photonStyles from '@photonhealth/components/dist/style.css?inline';

const hasUsableAddress = (address?: {
  street1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}) => {
  if (!address) {
    return false;
  }
  return Boolean(
    address.street1?.trim() &&
      address.city?.trim() &&
      address.state?.trim() &&
      address.postalCode?.trim()
  );
};

export const OrderCard = (props: {
  store: Record<string, any>;
  actions: Record<string, (...args: any) => any>;
  enableLocalPickup: boolean;
  enableSendToPatient: boolean;
  enableDeliveryPharmacies: boolean;
  mailOrderIds?: string;
}) => {
  const { setOrderFormData } = usePrescribe();
  const { dispatchAnalytics } = usePrescribeEventDispatch();
  const patientIds = createMemo(() =>
    props.store['patient']?.value ? [props.store['patient']?.value?.id] : []
  );

  const address = createMemo(() => {
    const address = props.store['address']?.value ?? props.store['patient']?.value?.address;
    if (!hasUsableAddress(address)) {
      return '';
    }
    return `${address.street1} ${address.street2 || ''} ${address.city}, ${address.state} ${
      address.postalCode
    }`;
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
          hasPreferredPharmacy={Boolean(props.store['patient']?.value?.preferredPharmacies?.length)}
          setFufillmentType={(type: string | undefined) => {
            props.actions.updateFormValue({
              key: 'fulfillmentType',
              value: type || ''
            });
            dispatchAnalytics({
              trackEventType: 'prescription_field_interaction',
              properties: { fieldName: 'fulfillmentType', hasValue: Boolean(type) }
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
