import {
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useToast,
  VStack
} from '@chakra-ui/react';
import { useMutation } from '@apollo/client';
import { usePhoton } from '@photonhealth/react';
import { useState } from 'react';
import { Order } from 'packages/sdk/dist/types';

import { StyledToast } from './StyledToast';
import { formatAddress } from '../../utils';
import { useProviderAnalytics } from '../../hooks/useProviderAnalytics';
import { useOrderUniqueTreatments } from '../../hooks/useOrderUniqueTreatments';
import { resendOrderMutation } from '../../mutations/clinical-api';
import { useHighestUserRole } from '../../hooks/useHighestUserRole';

type ResendOrderButtonProps = {
  order: Order & { pharmacy: NonNullable<Order['pharmacy']> };
};

const CONFIRMATION_CTA_TEXT = 'Resend order';

export function ResendOrderButton({ order }: ResendOrderButtonProps) {
  const [resending, setResending] = useState(false);
  const [resendModalOpen, setResendModalOpen] = useState(false);

  const toast = useToast();
  const { clinicalClient } = usePhoton();
  const providerAnalytics = useProviderAnalytics();
  const uniqueTreatments = useOrderUniqueTreatments(order);
  const userRole = useHighestUserRole();

  const [resendOrder] = useMutation(resendOrderMutation, {
    client: clinicalClient
  });

  const handleResendButtonClick = () => {
    setResendModalOpen(true);

    providerAnalytics.track('Customer Clicked Resend Order', {
      selector: userRole,
      orderId: order.id,
      patientId: order.patient.id,
      medicationIds: uniqueTreatments.map(({ id }) => id),
      medicationNames: uniqueTreatments.map(({ name }) => name)
    });
  };

  const handleResendConfirmation = async () => {
    if (resending) return;

    try {
      setResending(true);
      await resendOrder({ variables: { orderId: order.id } });

      toast({
        position: 'top-right',
        duration: 3000,
        render: ({ onClose: onToastClose }) => (
          <StyledToast
            onClose={onToastClose}
            type="success"
            title="Resend Successful"
            description="We've initiated a resend to the pharmacy"
          />
        )
      });

      providerAnalytics.track('Confirm Resend Order Clicked', {
        buttonText: CONFIRMATION_CTA_TEXT,
        orderId: order.id,
        patientId: order.patient.id,
        pharmacyId: order.pharmacy.id,
        pharmacyName: order.pharmacy.name,
        medicationIds: uniqueTreatments.map(({ id }) => id),
        medicationNames: uniqueTreatments.map(({ name }) => name)
      });
    } catch (error) {
      handleResendFailure(error as Error);
    } finally {
      setResending(false);
      setResendModalOpen(false);
    }
  };

  const handleResendFailure = (error: Error) => {
    console.error(error);
    const message = error instanceof Error ? error.message : `${error}`;

    toast({
      position: 'top-right',
      duration: 5000,
      render: ({ onClose: onToastClose }) => (
        <StyledToast
          onClose={onToastClose}
          type="error"
          title="Error Resending Order"
          description={message}
        />
      )
    });

    providerAnalytics.track('Resend Error Message Viewed', {
      message,
      orderId: order.id,
      patientId: order.patient.id,
      pharmacyId: order.pharmacy.id
    });
  };

  const handleResendCancel = () => {
    setResendModalOpen(false);

    providerAnalytics.track('Cancel Resend Order Clicked', {
      orderId: order.id,
      patientId: order.patient.id,
      medicationIds: uniqueTreatments.map(({ id }) => id),
      medicationNames: uniqueTreatments.map(({ name }) => name)
    });
  };

  return (
    <>
      <Button
        onClick={handleResendButtonClick}
        variant="outline"
        colorScheme="gray"
        borderColor="gray.300"
        borderRadius="lg"
        paddingY="1"
        paddingX="3"
      >
        Resend Order
      </Button>

      <Modal isOpen={resendModalOpen} onClose={handleResendCancel} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader borderBottom="1px" borderColor="gray.300">
            <HStack justify="space-between" width="full">
              <Text fontSize="md" fontWeight="normal" color="gray.500">
                Confirm resend to existing pharmacy
              </Text>
              <HStack justify="right">
                <Button disabled={resending} variant="ghost" onClick={handleResendCancel}>
                  Cancel
                </Button>
                <Button isLoading={resending} onClick={handleResendConfirmation}>
                  {CONFIRMATION_CTA_TEXT}
                </Button>
              </HStack>
            </HStack>
          </ModalHeader>
          <ModalBody p="6">
            <VStack
              alignItems="flex-start"
              border="1px"
              borderColor="gray.300"
              borderRadius="xl"
              spacing="0"
              padding="4"
            >
              <Text as="span" fontWeight="medium">
                {order.pharmacy.name}
              </Text>
              {order.pharmacy.address && (
                <Text as="span" color="gray.600">
                  {formatAddress(order.pharmacy.address)}
                </Text>
              )}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
