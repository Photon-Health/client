import { createMemo } from 'solid-js';
import { Card, PharmacySelect, Text } from '@photonhealth/components';
import photonStyles from '@photonhealth/components/dist/index.css?inline';
import { Address } from '@photonhealth/sdk/dist/types';

export const OrderCard = (props: {
  patientId: string;
  address?: Address;
  hasPreferredPharmacy: boolean;
}) => {
  const patientIds = createMemo(() => (props.patientId ? [props.patientId] : []));

  const address = createMemo(() => {
    if (!props.address) {
      return '';
    }
    return `${props.address.street1} ${props.address.street2 || ''} ${props.address.city}, ${
      props.address.state
    } ${props.address.postalCode}`;
  });

  return (
    <div>
      <style>{photonStyles}</style>
      <Card addChildrenDivider={true}>
        <div class="flex items-center justify-between">
          <Text color="gray">Select Pharmacy</Text>
        </div>
        <PharmacySelect
          patientIds={patientIds()}
          address={address()}
          hasPreferredPharmacy={props.hasPreferredPharmacy}
        />
      </Card>
    </div>
  );
};
