import { Pharmacy } from '@photonhealth/sdk/dist/types';
import { createEffect, createMemo, createSignal, Show } from 'solid-js';
import Badge, { BadgeColor } from '../../particles/Badge';
import Card from '../../particles/Card';
import Spinner from '../../particles/Spinner';
import Text from '../../particles/Text';
import { createQuery } from '../../utils/createQuery';
import formatAddress from '../../utils/formatAddress';
import {
  GetLastOrderQuery,
  GetLastOrderResponse,
  GetPreferredPharmaciesQuery,
  GetPreferredPharmaciesResponse
} from '../PharmacySearch';
import { usePhotonClient } from '../SDKProvider';

type STPState = {
  badgeColor: BadgeColor;
  badgeText: string;
  text: string;
};

const stpStates: {
  [key: string]: STPState;
} = {
  patientWillSelect: {
    badgeColor: 'purple',
    badgeText: 'Patient Will Select',
    text: 'Patient will select a pharmacy after you send an order.'
  },
  recentPharmacy: {
    badgeColor: 'yellow',
    badgeText: 'Recent Pharmacy',
    text: 'This patient selected this pharmacy in the last 8 hours. After you send this order, the patient can change the pharmacy.'
  },
  preferredPharmacy: {
    badgeColor: 'blue',
    badgeText: 'Preferred Pharmacy',
    text: 'This patient selected this as their preferred pharmacy.'
  }
};

export function SendToPatient(props: { patientId: string }) {
  const client = usePhotonClient();
  const [stpState, setStpState] = createSignal<STPState>(stpStates.patientWillSelect);
  const [pharmacy, setPharmacy] = createSignal<Pharmacy | undefined>(undefined);

  const queryOptions = createMemo(() => ({
    variables: { id: props.patientId },
    client: client!.apollo
  }));

  const preferredPharmaciesData = createQuery<GetPreferredPharmaciesResponse, { id: string }>(
    GetPreferredPharmaciesQuery,
    queryOptions
  );

  const lastOrderData = createQuery<GetLastOrderResponse, { id: string }>(
    GetLastOrderQuery,
    queryOptions
  );

  const notLoading = createMemo(() => !lastOrderData.loading && !preferredPharmaciesData.loading);
  const recentOrder = createMemo(() => {
    const lastOrder = lastOrderData()?.orders?.[0];
    if (lastOrder) {
      const now = new Date();
      const eightHoursAgo = new Date(now.getTime() - 8 * 60 * 60 * 1000);

      if (new Date(lastOrder.createdAt) > eightHoursAgo) {
        return lastOrder;
      }
    }
  });

  createEffect(() => {
    if (notLoading()) {
      const preferredPharmacies = preferredPharmaciesData()?.patient?.preferredPharmacies;
      const lastPharmacy = recentOrder()?.pharmacy;
      if ((preferredPharmacies?.length ?? 0) > 0) {
        setStpState(stpStates.preferredPharmacy);
        if (preferredPharmacies && preferredPharmacies.length > 0) {
          const firstPreferredPharmacy = preferredPharmacies[0];
          const updatedPharmacy: Pharmacy = {
            ...firstPreferredPharmacy,
            address: {
              country: '',
              postalCode: '',
              ...firstPreferredPharmacy.address
            }
          };
          setPharmacy(updatedPharmacy);
        }
      } else if (lastPharmacy) {
        setStpState(stpStates.recentPharmacy);
        setPharmacy(lastPharmacy);
      } else {
        setStpState(stpStates.patientWillSelect);
      }
    } else {
      setPharmacy(undefined);
    }
  });

  return (
    <Show when={notLoading()} fallback={<Spinner size="sm" />}>
      <div class="mt-4">
        <div>
          <Badge color={stpState().badgeColor}>{stpState().badgeText}</Badge>
        </div>

        <Text size="sm" class="py-4">
          {stpState().text}
        </Text>

        <Show when={pharmacy()}>
          <Card variant="gray">
            <div>
              <Text size="sm" bold>
                {pharmacy()!.name}
              </Text>
              <div>
                <Text size="sm">{formatAddress(pharmacy()!.address)}</Text>
              </div>
            </div>
          </Card>
        </Show>
      </div>
    </Show>
  );
}
