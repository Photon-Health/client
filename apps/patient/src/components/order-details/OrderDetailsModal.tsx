import {
  Box,
  Container,
  HStack,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack
} from '@chakra-ui/react';
import dayjs from 'dayjs';
import { ReactNode } from 'react';
import { MdOutlineLocalPharmacy } from 'react-icons/md';
import { renderWithLinks } from '../../utils/text';

export interface PrescriptionData {
  rxName: string;
  quantity: string;
  daysSupply?: number;
  numRefills: number;
  expiresAt?: Date;
}

export interface OrderDetailsProps {
  pharmacyName: string;
  pharmacyId?: string;
  pharmacyLogo?: ReactNode;
  prescriptions: PrescriptionData[];
}

export interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NEXT_STEPS_BY_PHARMACY: Record<string, string> = {
  [import.meta.env.VITE_AMAZON_PHARMACY_ID as string]:
    'Amazon Pharmacy will text you shortly — no action needed.\n\nNo text? Log in at [amazon.com/pharmacy](https://amazon.com/pharmacy) to view your prescription or create an account.\n\nStill having trouble? Contact support. You can also switch pharmacies if needed.'
};

const Row = ({ k, value }: { k: string; value: ReactNode }) => {
  return (
    <HStack justifyContent="space-between" w="full">
      <Text>{k}</Text>
      <Text as="b">{value}</Text>
    </HStack>
  );
};

const PrescriptionBlock = ({ rx }: { rx: PrescriptionData }) => {
  return (
    <VStack alignItems="start" spacing={3}>
      <Text as="b">{rx.rxName}</Text>
      <Row k="Quantity" value={rx.quantity} />
      {rx.daysSupply && <Row k="Days Supply" value={rx.daysSupply} />}
      <Row k="Refills" value={rx.numRefills} />
      {rx.expiresAt && <Row k="Expires" value={dayjs(rx.expiresAt).format('M/D/YYYY')} />}
    </VStack>
  );
};

const defaultIcon = (
  <VStack
    color="blue.400"
    bgColor="blue.50"
    borderRadius="full"
    w="12"
    h="12"
    justifyContent="center"
  >
    <Icon as={MdOutlineLocalPharmacy} boxSize={6} />
  </VStack>
);

export const OrderDetailsModal = (props: OrderDetailsProps & OrderDetailsModalProps) => {
  const nextSteps = props.pharmacyId ? NEXT_STEPS_BY_PHARMACY[props.pharmacyId] : undefined;
  const handleClose = () => {
    props.onClose();
  };

  return (
    <Modal isOpen={props.isOpen} onClose={handleClose} size="full">
      <ModalOverlay />
      <ModalContent backgroundColor="gray.100" alignItems="center" w="full">
        <ModalHeader>Order Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody w="full" alignItems="center" px={0}>
          <Container>
            <VStack alignItems="stretch" spacing={4} w="full">
              <VStack
                bgColor="white"
                borderRadius="xl"
                p={4}
                alignItems={'start'}
                spacing={5}
                w="full"
              >
                {props.pharmacyLogo ?? defaultIcon}
                <Box>
                  <Text fontSize="xl" as="h4">
                    This is your order summary for <b>{props.pharmacyName}</b>
                  </Text>
                </Box>
              </VStack>
              <VStack
                bgColor="white"
                borderRadius="xl"
                p={4}
                alignItems={'stretch'}
                spacing={5}
                w="full"
              >
                {props.prescriptions.map((p, i) => (
                  <PrescriptionBlock key={`${p.rxName}-${i}`} rx={p} />
                ))}
              </VStack>
              {nextSteps && (
                <VStack alignItems="stretch" spacing={2} w="full">
                  <Text fontWeight="bold" fontSize="lg">
                    Next Steps
                  </Text>
                  <Box bgColor="blue.50" borderRadius="xl" p={4}>
                    <Text whiteSpace="pre-wrap">{renderWithLinks(nextSteps)}</Text>
                  </Box>
                </VStack>
              )}
            </VStack>
          </Container>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
