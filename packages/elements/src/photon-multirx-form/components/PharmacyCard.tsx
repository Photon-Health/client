import { createEffect, createSignal, Show } from 'solid-js';
import { usePhoton } from '../../context';

export const PharmacyCard = (props: { pharmacyId: string | undefined }) => {
  const client = usePhoton();
  const [pharmacy, setPharmacy] = createSignal({ name: '' });

  createEffect(async () => {
    if (props.pharmacyId && client) {
      const { data } = await client.getSDK().clinical.pharmacy.getPharmacy({
        id: props.pharmacyId
      });
      setPharmacy(data.pharmacy);
    }
  });
  return (
    <photon-card>
      <div class="flex flex-col gap-3">
        <div class="flex flex-row">
          <p class="font-sans text-l font-medium flex-grow">Selected Pharmacy</p>
        </div>
        <Show when={!pharmacy()}>
          <sl-spinner style={{ 'font-size': '1rem' }} />
        </Show>

        <Show when={pharmacy()}>
          <div class="flex flex-col gap-2">{pharmacy()?.name}</div>
        </Show>
      </div>
    </photon-card>
  );
};
