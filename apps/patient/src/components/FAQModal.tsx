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
  Skeleton,
  SkeletonText,
  Stack,
  useToast,
  VStack
} from '@chakra-ui/react';
import { Card } from './Card';
import { FAQContents } from './FAQ';
import { useOrderContext } from '../views/Main';
import { usePatientAnalytics } from '../hooks/usePatientAnalytics';

export const FAQModal = ({
  isOpen,
  onClose,
  allowMessageSupport = true
}: {
  isOpen: boolean;
  onClose: () => void;
  allowMessageSupport?: boolean;
}) => {
  const { order, isDemo, faqs } = useOrderContext();
  const toast = useToast();
  const patientAnalytics = usePatientAnalytics();

  const handleMessageSupport = () => {
    if (isDemo) {
      toast({
        title: 'Feature unavailable',
        description: 'Support is disabled for the patient demo',
        status: 'warning',
        position: 'top',
        duration: 4000,
        isClosable: true
      });
    }

    patientAnalytics.track('Patient Clicked Message Support', order);
  };

  return (
    <Modal onClose={onClose} isOpen={isOpen} size="full">
      <ModalOverlay />
      <ModalContent backgroundColor="gray.100" alignItems="center" w="full">
        <ModalHeader>Frequently Asked Questions</ModalHeader>
        <ModalCloseButton />
        <ModalBody w="full" alignItems="center" px={0}>
          <Container>
            <VStack alignItems="stretch" spacing={6} w="full">
              <VStack bgColor="white" borderRadius="xl" px={4} py={1} alignItems={'start'} w="full">
                {faqs ? (
                  <FAQContents faqs={faqs} />
                ) : (
                  <Stack w="full" py={2} spacing={3}>
                    <Skeleton height="20px" />
                    <SkeletonText noOfLines={2} spacing="2" />
                  </Stack>
                )}
              </VStack>

              {allowMessageSupport && (
                <VStack w="full" alignItems="stretch" spacing={4}>
                  <Heading as="h4" size="md">
                    Still need help?
                  </Heading>
                  <Card>
                    <VStack spacing={1} w="full">
                      <Box>
                        If you have other pharmacy related questions, we are available 24/7 for
                        support. We typically respond within 30 minutes.
                      </Box>
                      {isDemo ? (
                        <Button
                          variant="outline"
                          color="blue.500"
                          w="full"
                          onClick={handleMessageSupport}
                        >
                          Message support
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
                          Message support
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
