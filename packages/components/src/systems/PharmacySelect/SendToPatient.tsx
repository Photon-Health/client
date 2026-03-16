import { Pharmacy } from '@photonhealth/sdk/dist/types';
import { createEffect, createMemo, createSignal, Show } from 'solid-js';
import Badge, { BadgeColor } from '../../particles/Badge';
import Card from '../../particles/Card';
import Spinner from '../../particles/Spinner';
import Text from '../../particles/Text';
import formatAddress from '../../utils/formatAddress';
import { usePhotonClient } from '../SDKProvider';
import { usePrescribe } from '../PrescribeProvider';
import { usePharmacySelectionContext } from '../PharmacySelect';
import { useSelectedPatientContext } from '../SelectedPatientProvider';

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
    text: 'Patient will select a pharmacy after you send the prescription(s).'
  },
  recentPharmacy: {
    badgeColor: 'yellow',
    badgeText: 'Recent Pharmacy',
    text: 'This patient selected this pharmacy in the last 8 hours. After you send this order, the patient can change the pharmacy.'
  },
  preferredPharmacy: {
    badgeColor: 'blue',
    badgeText: 'Preferred Pharmacy',
    text: "The patient can update their preferred pharmacy selection for 15 minutes. Otherwise, we'll send it to their preferred pharmacy on file."
  },
  coverageOptionPharmacy: {
    badgeColor: 'gray',
    badgeText: 'Selected Pharmacy',
    text: 'The selected option was for this pharmacy.'
  }
};

export function SendToPatient() {
  const client = usePhotonClient();
  const { selectedCoverageOption } = usePrescribe();
  const { pharmacyId } = usePharmacySelectionContext();
  const { preferredPharmacies, recentOrder, patientPharmacyDataLoading } =
    useSelectedPatientContext();

  const [stpState, setStpState] = createSignal<STPState>(stpStates.patientWillSelect);
  const [pharmacy, setPharmacy] = createSignal<Pharmacy | undefined>(undefined);

  const notLoading = createMemo(() => !patientPharmacyDataLoading());

  createEffect(() => {
    if (notLoading()) {
      const preferred = preferredPharmacies();
      const lastPharmacy = recentOrder()?.pharmacy;
      if ((preferred?.length ?? 0) > 0) {
        setStpState(stpStates.preferredPharmacy);
        if (preferred && preferred.length > 0) {
          const firstPreferredPharmacy = preferred[0];
          const updatedPharmacy: Pharmacy = {
            ...firstPreferredPharmacy,
            address: {
              street1: firstPreferredPharmacy.address?.street1 ?? '',
              city: firstPreferredPharmacy.address?.city ?? '',
              state: firstPreferredPharmacy.address?.state ?? '',
              country: '',
              postalCode: ''
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

  createEffect(() => {
    const coverageOption = selectedCoverageOption();
    const currentPharmacyId = pharmacyId();
    if (coverageOption && currentPharmacyId && coverageOption.pharmacy.id === currentPharmacyId) {
      setStpState(stpStates.coverageOptionPharmacy);
      client.clinical.pharmacy.getPharmacy({ id: currentPharmacyId }).then((result) => {
        setPharmacy(result.data.pharmacy);
      });
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
          {(phr) => (
            <Card variant="gray">
              <div>
                <Text size="sm" bold>
                  {phr().name}
                </Text>
                <div>
                  <Text size="sm">{formatAddress(phr().address)}</Text>
                </div>
              </div>
            </Card>
          )}
        </Show>
      </div>
    </Show>
  );
}
