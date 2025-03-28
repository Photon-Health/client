import { createEffect, createSignal, Show } from 'solid-js';
import { usePhoton } from '@photonhealth/components';
import { RadioGroupCards, Text } from '@photonhealth/components';
import { Pharmacy } from '@photonhealth/sdk/dist/types';

export const PharmacyCard = (props: { pharmacyId: string | undefined }) => {
  const client = usePhoton();
  const [pharmacy, setPharmacy] = createSignal<Pharmacy | null>(null);

  const fetchPharmacy = async (id: string) => {
    if (id && client) {
      const { data } = await client.getSDK().clinical.pharmacy.getPharmacy({ id });
      setPharmacy(data.pharmacy);
    }
  };

  createEffect(() => {
    if (props.pharmacyId) {
      fetchPharmacy(props.pharmacyId);
    }
  });

  return (
    <photon-card>
      <div class="flex flex-col gap-3">
        <div class="flex flex-row">
          <p class="font-sans text-l font-medium flex-grow">Selected Pharmacy</p>
        </div>

        <Show when={pharmacy()}>
          <RadioGroupCards label="Pharmacies" initSelected={props?.pharmacyId || ''}>
            <RadioGroupCards.Option value={props?.pharmacyId || ''}>
              <div class="flex flex-col items-start">
                <Text loading={!pharmacy()} sampleLoadingText="Loading Name">
                  {pharmacy()?.name}
                </Text>
                <Text
                  loading={!pharmacy()}
                  color="gray"
                  size="sm"
                  sampleLoadingText="Cityville, ST"
                >
                  <span>
                    {pharmacy()?.address?.city}, {pharmacy()?.address?.state}
                  </span>
                </Text>
              </div>
            </RadioGroupCards.Option>
          </RadioGroupCards>
        </Show>
      </div>
    </photon-card>
  );
};
