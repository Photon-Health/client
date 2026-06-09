import { useEffect, useMemo, useRef, useState } from 'react';
import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { Button, useToast } from '@chakra-ui/react';
import { getOrgMailOrderPharms } from '@client/settings';
import { usePhoton } from '@photonhealth/react';
import { Order } from '@photonhealth/sdk/dist/types';
import { FulfillmentType, OrderState } from 'packages/sdk/src/types';

import { Dialog } from './Dialog';
import { StyledToast } from './StyledToast';
import { rerouteOrderMutation } from '../../mutations/clinical-api/orders';
import { formatAddress } from '../../utils';
import { useProviderAnalytics } from '../../hooks/useProviderAnalytics';
import { GET_ORDER, getOrderRoutingHistory, PHARMACY_QUERY } from '../../queries';
import { useOrderUniqueTreatments } from '../../hooks/useOrderUniqueTreatments';
import { useHighestUserRole } from '../../hooks/useHighestUserRole';

interface RerouteOrderButtonProps {
  order: Order;
  organizationId: string;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'photon-pharmacy-select': unknown;
    }
  }
}

const CONFIRMATION_TEXT = 'Confirm Reroute';

export function RerouteOrderButton({ order, organizationId }: RerouteOrderButtonProps) {
  const toast = useToast();
  const apollo = useApolloClient();
  const { track } = useProviderAnalytics();
  const pharmacySelectRef = useRef<HTMLElement>(null);
  const mailOrderIds = useMemo(
    () => getOrgMailOrderPharms(organizationId)?.provider?.join(',') ?? '',
    [organizationId]
  );

  const [updating, setUpdating] = useState(false);
  const [rerouteModalOpen, setRerouteModalOpen] = useState(false);
  const [pharmacyId, setPharmacyId] = useState('');
  const [fulfillmentType, setFulfillmentType] = useState<string | undefined>(undefined);
  const confirmButtonDisabled = !!fulfillmentType && !pharmacyId;

  const uniqueTreatments = useOrderUniqueTreatments(order);
  const selector = useHighestUserRole();

  const routingHistory = useRoutingHistory(order.id);
  const [rerouteOrder] = useRerouteOrderMutation({ order, rerouteTo: pharmacyId });

  const handleRerouteButtonClick = () => {
    setPharmacyId('');
    setFulfillmentType(undefined);
    setRerouteModalOpen(true);

    track('Customer Clicked Reroute Order', {
      selector,
      numberOfReroutes: routingHistory.slice(1).length,
      orderId: order.id,
      patientId: order.patient.id,
      medicationIds: uniqueTreatments.map(({ id }) => id),
      medicationNames: uniqueTreatments.map(({ name }) => name)
    });
  };

  const handleRerouteCancel = () => {
    setPharmacyId('');
    setFulfillmentType(undefined);
    setRerouteModalOpen(false);

    track('Cancel Reroute Order Clicked', {
      selector,
      orderId: order.id,
      patientId: order.patient.id,
      medicationIds: uniqueTreatments.map(({ id }) => id),
      medicationNames: uniqueTreatments.map(({ name }) => name)
    });
  };

  const handleRerouteConfirmation = async () => {
    setUpdating(true);
    try {
      let pharmacyName: string | undefined = undefined;
      if (pharmacyId) {
        const { data: pharmacyData } = await apollo.query<{ pharmacy: Order['pharmacy'] }>({
          query: PHARMACY_QUERY,
          variables: { id: pharmacyId }
        });
        pharmacyName = pharmacyData?.pharmacy?.name;
      }

      track('Confirm Reroute Order Clicked', {
        buttonText: CONFIRMATION_TEXT,
        pharmacyId,
        pharmacyName,
        routingType: routingTypeLabel(fulfillmentType),
        orderId: order.id,
        patientId: order.patient.id,
        medicationIds: uniqueTreatments.map(({ id }) => id),
        medicationNames: uniqueTreatments.map(({ name }) => name)
      });

      await rerouteOrder({ variables: { orderId: order.id, pharmacyId } });

      setPharmacyId('');
      setFulfillmentType(undefined);
      setRerouteModalOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : `${error}`;
      track('Reroute Error Message Viewed', {
        orderId: order.id,
        patientId: order.patient.id,
        message
      });
      toast({
        position: 'top-right',
        duration: 5000,
        render: ({ onClose: onToastClose }) => (
          <StyledToast
            onClose={onToastClose}
            type="error"
            title="Error Rerouting Order"
            description={`There was an error rerouting the order: ${message}`}
          />
        )
      });
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    // effect to set up event listener that detects pharmacy selection from the web component
    if (!rerouteModalOpen) return;

    const el = pharmacySelectRef.current;
    if (!el) return;

    const pharmacySelectedHandler = (e: Event) => {
      const ce = e as CustomEvent<{ pharmacyId?: string; fulfillmentType?: string }>;
      const detail = ce.detail;
      setPharmacyId(detail?.pharmacyId ?? '');
      setFulfillmentType(detail?.fulfillmentType);
    };

    el.addEventListener('photon-pharmacy-selected', pharmacySelectedHandler);
    return () => el.removeEventListener('photon-pharmacy-selected', pharmacySelectedHandler);
  }, [rerouteModalOpen]);

  return (
    <>
      <Button
        onClick={handleRerouteButtonClick}
        variant="outline"
        colorScheme="gray"
        borderColor="gray.300"
        borderRadius="lg"
        paddingY="1"
        paddingX="3"
      >
        Reroute Order
      </Button>

      <Dialog isOpen={rerouteModalOpen} onClose={handleRerouteCancel} size="xl">
        <Dialog.Body pt="0.5" pb="4" px="4">
          <photon-pharmacy-select
            ref={pharmacySelectRef}
            data-testid="pharmacy-select"
            patient-id={order.patient.id}
            address={order.address ? formatAddress(order.address) : ''}
            pharmacy-id={order.pharmacy?.id}
            mail-order-ids={mailOrderIds}
            enable-local-pickup={true}
            enable-send-to-patient={true}
            enable-delivery-pharmacies={true}
            infer-send-to-patient-pharmacy={false}
            sticky-tab-header={true}
          />
        </Dialog.Body>
        <Dialog.Footer position="sticky" bottom="0">
          <Button variant="outline" size="sm" onClick={handleRerouteCancel} disabled={updating}>
            Cancel
          </Button>
          <Button
            variant="solid"
            colorScheme="blue"
            size="sm"
            isLoading={updating}
            loadingText="Rerouting..."
            isDisabled={confirmButtonDisabled}
            onClick={handleRerouteConfirmation}
          >
            {CONFIRMATION_TEXT}
          </Button>
        </Dialog.Footer>
      </Dialog>
    </>
  );
}

function useRerouteOrderMutation({ order, rerouteTo }: { order: Order; rerouteTo?: string }) {
  const toast = useToast();
  const apollo = useApolloClient();
  const { clinicalClient } = usePhoton();

  return useMutation(rerouteOrderMutation, {
    client: clinicalClient,
    update: async () => {
      try {
        const cachedResponse: { order: Order } | null = apollo.readQuery({
          query: GET_ORDER,
          variables: { id: order.id }
        });
        if (!cachedResponse?.order) return;

        let newPharmacy: Order['pharmacy'];
        if (rerouteTo) {
          // provider chose a pharmacy, get its data to update the cache
          const { data: pharmacyData } = await apollo.query<{ pharmacy: Order['pharmacy'] }>({
            query: PHARMACY_QUERY,
            variables: { id: rerouteTo }
          });
          newPharmacy = pharmacyData.pharmacy;
        }

        apollo.writeQuery({
          query: GET_ORDER,
          variables: { id: order.id },
          data: {
            order: {
              ...cachedResponse.order,
              state: newPharmacy ? OrderState.Pending : OrderState.Routing,
              pharmacy: newPharmacy || undefined
            }
          }
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : `${error}`;
        console.error('Failure in optimistically updating the cache with pharmacy data', message);
        toast({
          position: 'top-right',
          duration: 5000,
          render: ({ onClose: onToastClose }) => (
            <StyledToast
              onClose={onToastClose}
              type="error"
              title="Error loading pharmacy data"
              description="The order has been rerouted, but there was an error in loading the new pharmacy data. Refresh or come back later to see the updated order"
            />
          )
        });
      }
      return;
    }
  });
}

function useRoutingHistory(id: string) {
  const { clinicalClient } = usePhoton();

  const routingHistoryRes = useQuery(getOrderRoutingHistory, {
    client: clinicalClient,
    variables: { id }
  });
  const routingHistory = routingHistoryRes.data?.order?.routingHistory ?? [];
  return routingHistory;
}

function routingTypeLabel(type?: string) {
  switch (type) {
    case FulfillmentType.PickUp:
      return 'Local Pick-up';
    case FulfillmentType.MailOrder:
      return 'Mail Order';
    default:
      return 'Send to Patient';
  }
}
