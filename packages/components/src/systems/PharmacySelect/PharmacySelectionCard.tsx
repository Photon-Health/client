import { Pharmacy } from '@photonhealth/sdk/dist/types';
import { createEffect, createMemo, createSignal, Show } from 'solid-js';
import Badge from '../../particles/Badge';
import Icon from '../../particles/Icon';
import Spinner from '../../particles/Spinner';
import Text from '../../particles/Text';
import formatAddress from '../../utils/formatAddress';
import { usePhotonClient } from '../SDKProvider';
import { usePrescribe } from '../PrescribeProvider';
import { usePharmacySelectionContext } from '../PharmacySelect';
import { useSelectedPatientContext } from '../SelectedPatientProvider';

export type PharmacyCardState =
  | 'patientWillSelect'
  | 'preferredPharmacy'
  | 'recentPharmacy'
  | 'coverageOptionPharmacy'
  | 'providerSelected';

interface PharmacySelectionCardProps {
  patientId: string;
  providerSelectedPharmacy?: { name: string; address?: string };
  onChangePharmacy: () => void;
  onLetPatientChoose: () => void;
}

export function PharmacySelectionCard(props: PharmacySelectionCardProps) {
  const client = usePhotonClient();
  const { selectedCoverageOption } = usePrescribe();
  const { pharmacyId } = usePharmacySelectionContext();
  const { preferredPharmacies, recentOrder, patientPharmacyDataLoading } =
    useSelectedPatientContext();

  const [cardState, setCardState] = createSignal<PharmacyCardState>('patientWillSelect');
  const [pharmacy, setPharmacy] = createSignal<Pharmacy | undefined>(undefined);

  const notLoading = createMemo(() => !patientPharmacyDataLoading());

  // Determine initial state from preferred/recent pharmacy data
  createEffect(() => {
    if (notLoading() && !props.providerSelectedPharmacy) {
      const preferred = preferredPharmacies();
      const lastPharmacy = recentOrder()?.pharmacy;
      if (preferred.length > 0) {
        setCardState('preferredPharmacy');
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
      } else if (lastPharmacy) {
        setCardState('recentPharmacy');
        setPharmacy(lastPharmacy);
      } else {
        setCardState('patientWillSelect');
      }
    }
  });

  // Handle coverage option selection
  createEffect(() => {
    const coverageOption = selectedCoverageOption();
    const currentPharmacyId = pharmacyId();
    if (coverageOption && currentPharmacyId && coverageOption.pharmacy.id === currentPharmacyId) {
      setCardState('coverageOptionPharmacy');
      client.clinical.pharmacy.getPharmacy({ id: currentPharmacyId }).then((result) => {
        setPharmacy(result.data.pharmacy);
      });
    }
  });

  // Handle provider-selected pharmacy
  createEffect(() => {
    if (props.providerSelectedPharmacy) {
      setCardState('providerSelected');
    }
  });

  const stateConfig = createMemo(() => {
    const state = cardState();
    switch (state) {
      case 'patientWillSelect':
        return {
          title: 'Patient will select',
          description:
            'The patient will receive a link to pick their preferred pharmacy after you send the prescription.',
          showPharmacy: false,
          showBadge: false,
          showChange: false,
          bgTint: true
        };
      case 'preferredPharmacy':
        return {
          title: pharmacy()?.name || '',
          description:
            "The patient can update their preferred pharmacy selection for 15 minutes. Otherwise, we'll send it to their preferred pharmacy on file.",
          showPharmacy: true,
          showBadge: true,
          badgeText: 'Preferred',
          showChange: false,
          bgTint: false
        };
      case 'recentPharmacy':
        return {
          title: pharmacy()?.name || '',
          description:
            'This patient selected this pharmacy in the last 8 hours. After you send this order, the patient can change the pharmacy.',
          showPharmacy: true,
          showBadge: false,
          showChange: false,
          bgTint: false
        };
      case 'coverageOptionPharmacy':
        return {
          title: pharmacy()?.name || '',
          description: 'The selected option was for this pharmacy.',
          showPharmacy: true,
          showBadge: true,
          badgeText: 'Selected',
          showChange: false,
          bgTint: false
        };
      case 'providerSelected':
        return {
          title: props.providerSelectedPharmacy?.name || '',
          description: undefined,
          showPharmacy: true,
          showBadge: false,
          showChange: true,
          bgTint: false
        };
      default:
        return {
          title: 'Patient will select',
          description:
            'The patient will receive a link to pick their preferred pharmacy after you send the prescription.',
          showPharmacy: false,
          showBadge: false,
          showChange: false,
          bgTint: true
        };
    }
  });

  const pharmacyAddress = createMemo(() => {
    if (cardState() === 'providerSelected') {
      return props.providerSelectedPharmacy?.address || '';
    }
    const ph = pharmacy();
    if (!ph) return '';
    return formatAddress(ph.address);
  });

  return (
    <Show when={notLoading()} fallback={<Spinner size="sm" />}>
      <div
        class={`border border-blue-400 rounded-lg p-4 ${
          stateConfig().bgTint ? 'bg-blue-50' : 'bg-white'
        }`}
      >
        <div class="flex items-start gap-3">
          <div class="flex-shrink-0 mt-0.5">
            <Icon name="checkCircle" size="md" class="text-blue-500" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <Text size="sm" bold>
                {stateConfig().title}
              </Text>
              <Show when={stateConfig().showBadge}>
                <Badge size="sm" color="blue">
                  {stateConfig().badgeText}
                </Badge>
              </Show>
            </div>
            <Show when={stateConfig().showPharmacy && pharmacyAddress()}>
              <Text size="sm" color="gray">
                {pharmacyAddress()}
              </Text>
            </Show>
            <Show when={stateConfig().description}>
              <Text size="sm" color="gray" class="mt-1">
                {stateConfig().description}
              </Text>
            </Show>
          </div>
          <Show when={stateConfig().showChange}>
            <button
              class="flex-shrink-0 text-sm text-blue-600 hover:text-blue-800 font-medium"
              onClick={() => props.onChangePharmacy()}
            >
              Change
            </button>
          </Show>
        </div>
      </div>
      <Show when={cardState() === 'providerSelected'}>
        <button
          class="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
          onClick={() => props.onLetPatientChoose()}
        >
          Let the patient choose instead
        </button>
      </Show>
    </Show>
  );
}
