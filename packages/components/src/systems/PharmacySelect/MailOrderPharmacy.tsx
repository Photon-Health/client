import { Pharmacy } from '@photonhealth/sdk/dist/types';
import gql from 'graphql-tag';
import { createSignal, onMount } from 'solid-js';
import Text from '../../particles/Text';
import { usePhotonClient } from '../SDKProvider';

interface MailOrderPharmacyProps {
  pharmacyId: string;
}

const GetPharmacyQuery = gql`
  query GetPharmacy($id: ID!) {
    pharmacy(id: $id) {
      id
      name
      address {
        street1
        city
        state
      }
    }
  }
`;

export function MailOrderPharmacy(props: MailOrderPharmacyProps) {
  const { client } = usePhotonClient();
  const [pharmacy, setPharmacy] = createSignal<Pharmacy | null>(null);

  async function fetchPharmacy() {
    const { data } = await client!.apollo.query({
      query: GetPharmacyQuery,
      variables: { id: props.pharmacyId }
    });

    if (data?.pharmacy) {
      setPharmacy(data.pharmacy);
    }
  }

  onMount(() => {
    fetchPharmacy();
  });

  return (
    <div class="flex flex-col items-start">
      <Text loading={!pharmacy()} sampleLoadingText="Loading Name">
        {pharmacy()?.name}
      </Text>
      <Text loading={!pharmacy()} color="gray" size="sm" sampleLoadingText="Cityville, ST">
        <span>
          {pharmacy()?.address?.city}, {pharmacy()?.address?.state}
        </span>
      </Text>
    </div>
  );
}
