import { createEffect, createSignal, Show } from 'solid-js';
import { usePhoton } from '../../context';
import { RadioGroup, Text } from '@photonhealth/components';
import { Pharmacy } from '@photonhealth/sdk/dist/types';

export const PharmacyCard = (props: { pharmacyId: string | undefined }) => {
  const client = usePhoton();
  const [pharmacy, setPharmacy] = createSignal<Pharmacy | null>(null);

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

        <Show when={pharmacy()}>
          <RadioGroup label="Pharmacies" initSelected={props?.pharmacyId}>
            <RadioGroup.Option value={props?.pharmacyId}>
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
            </RadioGroup.Option>
          </RadioGroup>
        </Show>
      </div>
    </photon-card>
  );
};
