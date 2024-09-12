import {
  Button,
  Heading,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  Text,
  VStack
} from '@chakra-ui/react';
import { FC } from 'react';

interface CouponModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CouponModal: FC<CouponModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent py={3}>
        <ModalBody>
          <VStack mb={5} spacing={2} align="start">
            <Heading as="h5" size="sm">
              How to use this coupon
            </Heading>
            <Text>Just show it to the pharmacist when you pick up your prescription.</Text>
          </VStack>
          <VStack spacing={2} align="start">
            <Heading as="h5" size="sm">
              Can I use this coupon if I have health insurance?
            </Heading>
            <Text>
              The price on the coupon may be lower than your health insurance co-pay. It can be used
              instead of your co-pay and does not apply to your deductible.
            </Text>
            <Text>Ask your pharmacist to help you find the best possible price.</Text>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" colorScheme="blue" borderRadius="xl" onClick={onClose} w="full">
            Dismiss
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
