import {
  Box,
  Button,
  Container,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useToast,
  VStack
} from '@chakra-ui/react';
import { Card } from './Card';
import { FAQContents } from './FAQ';
import { useOrderContext } from '../views/Main';
import { patientAnalytics } from '../configs/analytics';
import { useText } from '../hooks/useText';

export const FAQModal = ({
  isOpen,
  onClose,
  allowMessageSupport = true
}: {
  isOpen: boolean;
  onClose: () => void;
  allowMessageSupport?: boolean;
}) => {
  const { order, isDemo } = useOrderContext();
  const toast = useToast();
  const t = useText();

  const handleClose = () => {
    onClose();
  };

  const handleMessageSupport = () => {
    if (isDemo) {
      toast({
        title: t.faqFeatureUnavailable,
        description: t.faqSupportDisabled,
        status: 'warning',
        position: 'top',
        duration: 4000,
        isClosable: true
      });
    }

    patientAnalytics.track('Patient Clicked Message Support', order, {
      isDemo: isDemo
    });
  };

  return (
    <Modal onClose={handleClose} isOpen={isOpen} size="full">
      <ModalOverlay />
      <ModalContent backgroundColor="gray.100" alignItems="center" w="full">
        <ModalHeader>{t.faqTitle}</ModalHeader>
        <ModalCloseButton />
        <ModalBody w="full" alignItems="center" px={0}>
          <Container>
            <VStack alignItems="stretch" spacing={6} w="full">
              <VStack bgColor="white" borderRadius="xl" px={4} py={1} alignItems={'start'} w="full">
                <FAQContents />
              </VStack>

              {allowMessageSupport && (
                <VStack w="full" alignItems="stretch" spacing={4}>
                  <Heading as="h4" size="md">
                    {t.faqStillNeedHelp}
                  </Heading>
                  <Card>
                    <VStack spacing={1} w="full">
                      <Box>{t.faqSupportText}</Box>
                      {isDemo ? (
                        <Button
                          variant="outline"
                          color="blue.500"
                          w="full"
                          onClick={handleMessageSupport}
                        >
                          {t.faqMessageSupport}
                        </Button>
                      ) : (
                        <Button
                          as="a"
                          variant="outline"
                          color="blue.500"
                          href={`sms:${import.meta.env.VITE_TWILIO_SMS_NUMBER}`}
                          w="full"
                          onClick={handleMessageSupport}
                        >
                          {t.faqMessageSupport}
                        </Button>
                      )}
                    </VStack>
                  </Card>
                </VStack>
              )}
            </VStack>
          </Container>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
