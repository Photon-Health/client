import { createEffect, createMemo, createSignal, Show } from 'solid-js';
import Badge, { BadgeColor } from '../../particles/Badge';
import Card from '../../particles/Card';
import Spinner from '../../particles/Spinner';
import Text from '../../particles/Text';
import { BaseOptions, createQuery } from '../../utils/createQuery';
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
  const [pharmacy, setPharmacy] = createSignal<any | undefined>(undefined);

  // const preferredPharmaciesData = createQuery<GetPreferredPharmaciesResponse, { id: string }>(
  //   GetPreferredPharmaciesQuery,
  //   {
  //     variables: { id: props.patientId },
  //     client: client!.apollo
  //   }
  // );

  const lastOrderData = createQuery<GetLastOrderResponse, { id: string }>(GetLastOrderQuery, {
    variables: { id: props.patientId },
    client: client!.apollo
  });

  createEffect(() => {
    const lastOrder = lastOrderData()?.orders?.[0];
    console.log('lastOrder', lastOrderData());
    if (!lastOrderData.loading && lastOrder) {
      if (lastOrder.pharmacy) {
        setStpState(stpStates.recentPharmacy);
        setPharmacy(lastOrder.pharmacy);
      }
    }
  });

  return (
    <Show when={!lastOrderData.loading} fallback={<Spinner />}>
      <Badge color={stpState().badgeColor}>{stpState().badgeText}</Badge>
      <Text size="sm" class="py-4">
        {stpState().text}
      </Text>

      <Show when={pharmacy()}>
        <Card gray>{pharmacy()?.name}</Card>
      </Show>
    </Show>
  );
}
