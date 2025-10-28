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
import { getPharmacies } from '../../api';
import { PoweredBy } from '../PoweredBy';
import { MailOrderSelectList } from './MailOrderSelectList';
import { MailOrderPharmacyOption } from './MailOrderSelectCard';

type MailOrderSelectModalProps = Omit<ModalProps, 'children'> & {
  onConfirm: (val: MailOrderPharmacyOption) => unknown;
};

export function MailOrderSelectModal({ onConfirm, ...modalProps }: MailOrderSelectModalProps) {
  const [confirming, setConfirming] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<MailOrderPharmacyOption | undefined>();
  const [pharmacyOptions, setPharmacyOptions] = useState<MailOrderPharmacyOption[] | undefined>();

  const handleConfirm = async () => {
    if (!selectedOption || confirming) return;

    setConfirming(true);
    try {
      await onConfirm(selectedOption);
    } finally {
      setConfirming(false);
    }
  };

  useEffect(() => {
    // load all the pharmacy options on mount
    async function loadMailOrderPharmacies() {
      const { pharmacies } = await getPharmacies({
        limit: 50,
        offset: 0,
        fulfillmentType: 'MAIL_ORDER',
        integrated: false
      });
      setPharmacyOptions(pharmacies);
    }

    loadMailOrderPharmacies();
  }, []);

  useEffect(() => {
    // clear out the selected option when the modal closes
    if (!modalProps.isOpen && !!selectedOption) {
      setSelectedOption(undefined);
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
            {pharmacyOptions && (
              <MailOrderSelectList
                options={pharmacyOptions}
                selectedId={selectedOption?.id}
                onSelect={(val) =>
                  setSelectedOption(val.id !== selectedOption?.id ? val : undefined)
                }
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
