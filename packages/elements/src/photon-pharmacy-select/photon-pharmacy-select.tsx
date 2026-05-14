import {
  DraftPrescriptionsProvider,
  PharmacySelect,
  PharmacySelectionProvider,
  PrescribeEventDispatchProvider,
  PrescribeProvider,
  RecentOrders,
  usePharmacySelectionContext
} from '@photonhealth/components';
import { customElement } from 'solid-element';
import { createEffect } from 'solid-js';
import { types } from '@photonhealth/sdk';
import tailwind from '../tailwind.css?inline';

interface PhotonPharmacySelectProps {
  patientId?: string;
  address?: string;
  pharmacyId?: string;
  mailOrderIds?: string;
  enableLocalPickup: boolean;
  enableSendToPatient: boolean;
  enableDeliveryPharmacies: boolean;
}

type PharmacySelectedDetail = {
  pharmacyId: string | undefined;
  fulfillmentType: types.FulfillmentType | undefined;
  updatePreferredPharmacy: boolean;
};

const PharmacySelectWithEvents = (props: {
  patientId?: string;
  address?: string;
  onChange: (detail: PharmacySelectedDetail) => void;
}) => {
  const ctx = usePharmacySelectionContext();

  let isFirst = true;
  createEffect(() => {
    const pharmacyId = ctx.pharmacyId();
    const fulfillmentType = ctx.fulfillmentType();
    const updatePreferredPharmacy = ctx.updatePreferredPharmacy();

    if (isFirst) {
      isFirst = false;
      return;
    }

    props.onChange({ pharmacyId, fulfillmentType, updatePreferredPharmacy });
  });

  return (
    <PharmacySelect
      patientIds={props.patientId ? [props.patientId] : undefined}
      address={props.address}
    />
  );
};

const PhotonPharmacySelectComponent = (props: PhotonPharmacySelectProps) => {
  let ref!: HTMLDivElement;

  const dispatchPharmacySelected = (detail: PharmacySelectedDetail) => {
    const event = new CustomEvent('photon-pharmacy-selected', {
      composed: true,
      bubbles: true,
      detail
    });
    ref?.dispatchEvent(event);
  };

  return (
    <div ref={ref}>
      <style>{tailwind}</style>
      <PrescribeEventDispatchProvider>
        <RecentOrders patientId={props.patientId ?? ''}>
          <DraftPrescriptionsProvider
            patientId={props.patientId || ''}
            templateIdsPrefill={[]}
            templateOverrides={{}}
            prescriptionIdsPrefill={[]}
            enableCombineAndDuplicate={false}
          >
            <PharmacySelectionProvider
              pharmacyIdProp={props.pharmacyId}
              enableLocalPickup={props.enableLocalPickup}
              enableSendToPatient={props.enableSendToPatient}
              enableDeliveryPharmacies={props.enableDeliveryPharmacies}
              mailOrderIds={props.mailOrderIds}
            >
              <PrescribeProvider patientId={props.patientId || ''} enableCoverageCheck={false}>
                <PharmacySelectWithEvents
                  patientId={props.patientId}
                  address={props.address}
                  onChange={dispatchPharmacySelected}
                />
              </PrescribeProvider>
            </PharmacySelectionProvider>
          </DraftPrescriptionsProvider>
        </RecentOrders>
      </PrescribeEventDispatchProvider>
    </div>
  );
};

customElement(
  'photon-pharmacy-select',
  {
    patientId: undefined,
    address: undefined,
    pharmacyId: undefined,
    mailOrderIds: undefined,
    enableLocalPickup: false,
    enableSendToPatient: false,
    enableDeliveryPharmacies: false
  },
  PhotonPharmacySelectComponent
);
