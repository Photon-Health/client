import {
  Container,
  VStack,
  Text,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalHeader,
  ModalBody,
  Box,
  Icon,
  Heading
} from '@chakra-ui/react';
import dayjs from 'dayjs';
import { ReactNode } from 'react';
import { MdOutlineLocalPharmacy } from 'react-icons/md';

export interface PrescriptionData {
  rxName: string;
  quantity: string;
  daysSupply: number;
  numRefills: number;
  expiresAt: Date;
}

export interface OrderDetailsProps {
  pharmacyName: string;
  pharmacyLogo?: ReactNode;

  prescriptions: PrescriptionData[];
}
export interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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
      <Row k="Days Supply" value={rx.daysSupply} />
      <Row k="Refills" value={rx.numRefills} />
      <Row k="Expires" value={dayjs(rx.expiresAt).format('M/D/YYYY')} />
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
  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose} size="full">
      <ModalOverlay />
      <ModalContent backgroundColor="gray.100" alignItems="center" w="full">
        <ModalHeader>Order Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody w="full" alignItems="center" px={0}>
          <Container>
            <VStack alignItems="stretch" spacing={4} w="full">
              <VStack
                bgColor="white"
                borderRadius="md"
                p={4}
                alignItems={'start'}
                spacing={5}
                w="full"
              >
                {props.pharmacyLogo ?? defaultIcon}
                <Box>
                  <Text fontSize="xl" as="h4">
                    This is your order summary for{' '}
                  </Text>
                  <Heading as="b" size="md">
                    {props.pharmacyName}
                  </Heading>
                </Box>
              </VStack>
              <VStack
                bgColor="white"
                borderRadius="md"
                p={4}
                alignItems={'stretch'}
                spacing={5}
                w="full"
              >
                {props.prescriptions.map((p, i) => (
                  <PrescriptionBlock key={`${p.rxName}-${i}`} rx={p} />
                ))}
              </VStack>
            </VStack>
          </Container>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
