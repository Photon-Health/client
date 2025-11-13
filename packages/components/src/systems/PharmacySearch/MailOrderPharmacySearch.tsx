import { Address, Pharmacy } from '@photonhealth/sdk/dist/types';
import { ListPharmaciesQuery } from '../../fetch';
import { usePhotonClient } from '../SDKProvider';
import { PharmacyOption, PharmacySearchInput } from './PharmacySearch';
import { createEffect, createMemo, createSignal } from 'solid-js';

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
  const [nameSearch, setNameSearch] = createSignal<string>('');
  const [pharmacies, setPharmacies] = createSignal<PharmacyListResult[]>();

  const hidden = createMemo(() => {
    // hide the combobox if there are no non-integrated mail orders in the env
    // our temporary approach to feature flagging
    const pharmacyResults = pharmacies();
    return pharmacyResults && pharmacyResults.length === 0;
  });

  const pharmacyOptions = createMemo(() => {
    // just doing client side filtering for now, since there's only like 8 viable pharmacies
    const search = nameSearch();
    const nameRegex = search ? new RegExp(search, 'i') : null;

    const byName = (pharmacy: PharmacyListResult) => !nameRegex || nameRegex.test(pharmacy.name);
    const toOption = (pharmacy: PharmacyListResult) => ({
      ...pharmacy,
      isPreferred: false,
      isPrevious: false
    });

    return pharmacies()?.filter(byName).map(toOption);
  });

  createEffect(() => {
    // effect hook for loading the pharmacies
    async function loadPharmacies() {
      setLoading(true);
      try {
        const { data } = await client.apolloClinical.query({
          query: ListPharmaciesQuery,
          variables: {
            offset: 0,
            limit: 40,
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
    // if selected value is cleared, then clear the name search
    if (!props.selected) {
      setNameSearch('');
    }
  });

  return (
    <>
      {hidden() ? null : (
        <PharmacySearchInput
          label={
            <div class="mb-2">
              <label>Search home delivery options</label>
            </div>
          }
          options={pharmacyOptions()}
          onSearch={setNameSearch}
          value={props.selected}
          setValue={props.selectPharmacy}
          loading={loading()}
        />
      )}
    </>
  );
}
