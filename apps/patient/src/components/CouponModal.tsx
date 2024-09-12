import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay
} from '@chakra-ui/react';
import React from 'react';

interface CouponModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CouponModal: React.FC<CouponModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent py={3}>
        <ModalBody>
          <Box mb={4}>
            <strong>How to use this coupon</strong>
            <p>Just show it to the pharmacist when you pick up your prescription.</p>
          </Box>
          <Box>
            <strong>Can I use this coupon if I have health insurance?</strong>
            <p>
              The price on the coupon may be lower than your health insurance co-pay. It can be used
              instead of your co-pay and does not apply to your deductible. Ask your pharmacist to
              help you find the best possible price.
            </p>
          </Box>
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
