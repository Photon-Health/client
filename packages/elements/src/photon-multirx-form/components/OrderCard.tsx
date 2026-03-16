import { createMemo } from 'solid-js';
import { Card, PharmacySelect, Text } from '@photonhealth/components';
import photonStyles from '@photonhealth/components/dist/index.css?inline';

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

export const OrderCard = (props: { store: Record<string, any> }) => {
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
          <Text color="gray">Pharmacy</Text>
        </div>
        <PharmacySelect
          patientIds={patientIds()}
          address={address()}
          hasPreferredPharmacy={Boolean(props.store['patient']?.value?.preferredPharmacies?.length)}
        />
      </Card>
    </div>
  );
};
