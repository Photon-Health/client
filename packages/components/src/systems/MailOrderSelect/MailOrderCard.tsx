import { Pharmacy } from '@photonhealth/sdk/dist/types';
import gql from 'graphql-tag';
import { createSignal, JSXElement, onMount } from 'solid-js';
import { usePhoton } from '../../context';
import Card from '../../particles/Card';

interface MailOrderCardProps {
  pharmacyId: string;
  children: JSXElement;
  selected?: boolean;
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

export function MailOrderCard(props: MailOrderCardProps) {
  const client = usePhoton();
  const [pharmacy, setPharmacy] = createSignal<Pharmacy | null>(null);

  async function fetchPharmacy() {
    const { data } = await client!.sdk.apollo.query({
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
    <Card selected={props?.selected}>
      <div class="flex justify-between items-center">
        <div>
          <label class="sr-only" for={props?.pharmacyId}>
            {pharmacy()?.name}
          </label>
          <div>{pharmacy()?.name}</div>
          <div class="text-sm text-slate-500">
            {pharmacy()?.address?.city}, {pharmacy()?.address?.state}
          </div>
        </div>
        <div>{props.children}</div>
      </div>
    </Card>
  );
}
