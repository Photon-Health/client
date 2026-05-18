import { Button, useToast } from '@chakra-ui/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getOrgMailOrderPharms } from '@client/settings';
import { Dialog } from './Dialog';
import { useApolloClient, useMutation } from '@apollo/client';
import { rerouteOrderMutation } from '../../mutations/clinical-api/orders';
import { Order } from '@photonhealth/sdk/dist/types';
import { formatAddress } from '../../utils';
import { useProviderAnalytics } from '../../hooks/useProviderAnalytics';
import { StyledToast } from './StyledToast';
import { GET_ORDER, PHARMACY_QUERY } from '../../queries';
import { OrderState } from 'packages/sdk/src/types';
import { usePhoton } from '@photonhealth/react';

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

export function RerouteOrderButton({ order, organizationId }: RerouteOrderButtonProps) {
  const { track } = useProviderAnalytics();
  const toast = useToast();
  const apollo = useApolloClient();
  const { clinicalClient } = usePhoton();

  const [updating, setUpdating] = useState(false);
  const [rerouteModalOpen, setRerouteModalOpen] = useState(false);
  const [pharmacyId, setPharmacyId] = useState('');
  const [fulfillmentType, setFulfillmentType] = useState<string | undefined>(undefined);

  const confirmButtonDisabled = !!fulfillmentType && !pharmacyId;

  const pharmacySelectRef = useRef<HTMLElement>(null);
  const mailOrderIds = useMemo(
    () => getOrgMailOrderPharms(organizationId)?.provider?.join(',') ?? '',
    [organizationId]
  );

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

  const handleRerouteButtonClick = () => {
    setPharmacyId('');
    setFulfillmentType(undefined);
    setRerouteModalOpen(true);
    // TODO: Tracking event
  };

  const handleRerouteCancel = () => {
    setPharmacyId('');
    setFulfillmentType(undefined);
    setRerouteModalOpen(false);
    // TODO: Tracking event
  };

  const handleRerouteConfirmation = async () => {
    setUpdating(true);
    try {
      track('Confirm Reroute Order Clicked', {
        // TODO: add more attributes
        orderId: order.id,
        pharmacyId
      });

      await rerouteOrder({ variables: { orderId: order.id, pharmacyId } });

      setPharmacyId('');
      setFulfillmentType(undefined);
      setRerouteModalOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : `${error}`;
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

  const [rerouteOrder] = useMutation(rerouteOrderMutation, {
    client: clinicalClient,
    update: async () => {
      try {
        const cachedResponse: { order: Order } | null = apollo.readQuery({
          query: GET_ORDER,
          variables: { id: order.id }
        });
        if (!cachedResponse?.order) return;

        let newPharmacy: Order['pharmacy'];
        if (pharmacyId) {
          // provider chose a pharmacy, get its data to update the cache
          const { data: pharmacyData } = await apollo.query<{ pharmacy: Order['pharmacy'] }>({
            query: PHARMACY_QUERY,
            variables: { id: pharmacyId }
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
            patient-id={order.patient.id}
            address={order.address ? formatAddress(order.address) : ''}
            pharmacy-id={order.pharmacy?.id}
            mail-order-ids={mailOrderIds}
            enable-local-pickup={true}
            enable-send-to-patient={true}
            enable-delivery-pharmacies={true}
            infer-send-to-patient-pharmacy={false}
          />
        </Dialog.Body>
        <Dialog.Footer>
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
            Confirm Reroute
          </Button>
        </Dialog.Footer>
      </Dialog>
    </>
  );
}
