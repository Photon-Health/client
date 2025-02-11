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
import { useLocation } from 'react-router-dom';

import { useOrderContext } from '../views/Main';
import { text as t } from '../utils/text';

interface CouponModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CouponModal: FC<CouponModalProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { flattenedFills } = useOrderContext();

  const isMultiRx = flattenedFills.length > 1;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent py={3}>
        <ModalBody>
          {location.pathname === '/pharmacy' ? (
            <VStack mb={5} spacing={2} align="start">
              <Heading as="h5" size="sm">
                {t.whatIsCouponPrice}
              </Heading>
              <Text>{t.couponHelpsPayLess}</Text>
            </VStack>
          ) : (
            <VStack mb={5} spacing={2} align="start">
              <Heading as="h5" size="sm">
                {t.howToCoupon}
              </Heading>
              <Text>{t.showCouponToPharmacy(isMultiRx)}</Text>
            </VStack>
          )}
          <VStack mb={5} spacing={2} align="start">
            <Heading as="h5" size="sm">
              {t.couponWithInsurance}
            </Heading>
            <Text>{t.couponVsInsurance}</Text>
            <Text>{t.noMedicare}</Text>
            <Text>{t.askForBestPrice}</Text>
          </VStack>
          <VStack spacing={2} align="start">
            <Heading as="h5" size="sm">
              {t.priceDifference}
            </Heading>
            <Text>{t.pricesCanChange}</Text>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" colorScheme="blue" borderRadius="xl" onClick={onClose} w="full">
            {t.dismiss}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
