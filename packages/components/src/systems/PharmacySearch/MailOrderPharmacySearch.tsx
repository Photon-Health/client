import { Address, Pharmacy } from '@photonhealth/sdk/dist/types';
import { ListPharmaciesQuery } from '../../fetch';
import { usePhotonClient } from '../SDKProvider';
import { PharmacyOption, PharmacySearchInput } from './PharmacySearch';
import { createEffect, createMemo, createSignal } from 'solid-js';

type PharmacyListResult = Pick<Pharmacy, 'id' | 'name'> & {
  address: Pick<Address, 'street1' | 'city' | 'state'>;
};

export function MailOrderPharmacySearch() {
  const client = usePhotonClient();
  const [loading, setLoading] = createSignal<boolean>(false);
  const [nameQuery, setNameQuery] = createSignal<string>();
  const [pharmacies, setPharmacies] = createSignal<PharmacyListResult[]>();

  const pharmacyOptions = createMemo(() =>
    pharmacies()?.map((option) => ({ ...option, isPreferred: false, isPrevious: false }))
  );

  // GASDGASDFASDF
  const [selected, setSelected] = createSignal<PharmacyOption>();

  createEffect(() => {
    async function loadPharmacies() {
      setLoading(true);
      try {
        const { data } = await client.apolloClinical.query({
          query: ListPharmaciesQuery,
          variables: {
            offset: 0,
            limit: 40,
            name: nameQuery() || undefined,
            fulfillmentType: 'MAIL_ORDER',
            integrated: false
          }
        });
        setPharmacies(data.pharmacies);
      } catch (err) {
        console.error('Failed to load mail order pharmacy options', err);
      } finally {
        setLoading(false);
      }
    }
    loadPharmacies();
  });

  return (
    <PharmacySearchInput
      label={
        <div class="mb-2">
          <label>Search home delivery options</label>
        </div>
      }
      options={pharmacyOptions()}
      onSearch={setNameQuery}
      value={selected()}
      setValue={setSelected}
      loading={loading()}
    />
  );
}
