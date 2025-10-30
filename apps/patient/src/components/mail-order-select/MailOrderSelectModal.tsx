import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalProps,
  Slide,
  Spinner,
  Text,
  VStack
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { PoweredBy } from '../PoweredBy';
import { MailOrderSelectList } from './MailOrderSelectList';
import { MailOrderPharmacyOption } from './MailOrderSelectCard';
import { datadogRum } from '@datadog/browser-rum';

type MailOrderSelectModalProps = Omit<ModalProps, 'children'> & {
  options?: MailOrderPharmacyOption[];
  onConfirm: (val: MailOrderPharmacyOption) => unknown;
};

export function MailOrderSelectModal({
  options,
  onConfirm,
  ...modalProps
}: MailOrderSelectModalProps) {
  const [confirming, setConfirming] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<MailOrderPharmacyOption | undefined>();

  const handleOptionSelect = (val: MailOrderPharmacyOption) => {
    const newSelection = val.id !== selectedOption?.id;
    if (newSelection) {
      datadogRum.addAction('patient_mail_order_pharmacy_selected', {
        pharmacyId: val.id
      });
    }
    setSelectedOption(newSelection ? val : undefined);
  };

  const handleConfirm = async () => {
    if (!selectedOption || confirming) return;

    setConfirming(true);
    try {
      await onConfirm(selectedOption);
      datadogRum.addAction('patient_mail_order_pharmacy_confirmed', {
        pharmacyId: selectedOption.id
      });
    } finally {
      setConfirming(false);
    }
  };

  useEffect(() => {
    // clear out the selected option when the modal closes
    if (!modalProps.isOpen && !!selectedOption) {
      setSelectedOption(undefined);
    }

    // track the modal opening event
    if (modalProps.isOpen) {
      datadogRum.addAction('patient_mail_order_modal_opened');
    } else {
      datadogRum.addAction('patient_mail_order_modal_closed');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalProps.isOpen]);

  return (
    <Modal {...modalProps} size="full">
      <ModalContent>
        <ModalHeader
          paddingX="4"
          paddingBottom="4"
          paddingTop="58px"
          fontSize="2xl"
          fontWeight="700"
          backgroundColor="gray.50"
          position="sticky"
          top="0"
          zIndex="10"
        >
          <Text maxWidth="xl" marginX="auto">
            Mail Order Pharmacies
          </Text>
        </ModalHeader>
        <ModalCloseButton marginTop="54px" zIndex="10" position="fixed" />
        <ModalBody padding="3" rowGap="4" backgroundColor="gray.50">
          <VStack rowGap="4" paddingBottom="32" marginX="auto" maxWidth="xl">
            <Text
              paddingX="3"
              paddingY="2"
              borderRadius="md"
              backgroundColor="blue.100"
              fontSize="md"
              fontWeight="500"
              lineHeight="shorter"
            >
              If you can't find your pharmacy, please reach out to your provider.
            </Text>
            {options && (
              <MailOrderSelectList
                options={options}
                selectedId={selectedOption?.id}
                onSelect={handleOptionSelect}
              />
            )}
          </VStack>
        </ModalBody>
        <Slide direction="bottom" in={!!selectedOption}>
          <ModalFooter
            position="sticky"
            bottom="0"
            w="full"
            padding="4"
            backgroundColor="Background"
          >
            <VStack w="full" rowGap="3">
              <Button
                w="full"
                maxWidth="xl"
                marginX="auto"
                variant="brand"
                padding="4"
                h="auto"
                onClick={handleConfirm}
                leftIcon={confirming ? <Spinner h="4" w="4" /> : undefined}
              >
                <Text as="span" lineHeight="none">
                  Place Order
                </Text>
              </Button>
              <PoweredBy />
            </VStack>
          </ModalFooter>
        </Slide>
      </ModalContent>
    </Modal>
  );
}
