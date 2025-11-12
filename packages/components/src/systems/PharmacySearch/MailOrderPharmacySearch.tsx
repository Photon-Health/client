import { Address, Pharmacy } from '@photonhealth/sdk/dist/types';
import { ListPharmaciesQuery } from '../../fetch';
import { usePhotonClient } from '../SDKProvider';
import { PharmacyOption, PharmacySearchInput } from './PharmacySearch';
import { createEffect, createMemo, createSignal, onCleanup } from 'solid-js';

type PharmacyListResult = Pick<Pharmacy, 'id' | 'name'> & {
  address: Pick<Address, 'street1' | 'city' | 'state'>;
};

type MailOrderPharmacySearchProps = {
  selected?: PharmacyOption;
  selectPharmacy: (val: PharmacyOption) => unknown;
};

export function MailOrderPharmacySearch(props: MailOrderPharmacySearchProps) {
  const client = usePhotonClient();
  const [loading, setLoading] = createSignal<boolean>(false);
  const [nameQuery, setNameQuery] = createSignal<string>();
  const [debouncedNameQuery, setDebouncedNameQuery] = createSignal<string>();
  const [pharmacies, setPharmacies] = createSignal<PharmacyListResult[]>();

  const pharmacyOptions = createMemo(() =>
    pharmacies()?.map((option) => ({ ...option, isPreferred: false, isPrevious: false }))
  );

  createEffect(() => {
    // effect hook for loading the pharmacies
    async function loadPharmacies() {
      setLoading(true);
      try {
        const name = debouncedNameQuery() || undefined;
        const { data } = await client.apolloClinical.query({
          query: ListPharmaciesQuery,
          variables: {
            offset: 0,
            limit: 40,
            name,
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

  createEffect(() => {
    // debounce the search query usage
    const name = nameQuery();
    const timeoutId = setTimeout(() => {
      setDebouncedNameQuery(name);
    }, 600);

    onCleanup(() => clearTimeout(timeoutId));
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
      value={props.selected}
      setValue={props.selectPharmacy}
      loading={loading()}
    />
  );
}
