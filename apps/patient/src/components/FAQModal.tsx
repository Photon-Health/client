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
  VStack
} from '@chakra-ui/react';
import { Card } from './Card';
import { FAQContents } from './FAQ';

export const FAQModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  return (
    <Modal onClose={onClose} isOpen={isOpen} size="full">
      <ModalOverlay />
      <ModalContent backgroundColor="gray.100" alignItems="center" w="full">
        <ModalHeader>Frequently Asked Questions</ModalHeader>
        <ModalCloseButton />
        <ModalBody w="full" alignItems="center" px={0}>
          <Container>
            <VStack alignItems="stretch" spacing={6} w="full">
              <VStack bgColor="white" borderRadius="md" px={4} py={1} alignItems={'start'} w="full">
                <FAQContents />
              </VStack>

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
                    <Button
                      as="a"
                      variant="outline"
                      color="blue.500"
                      href={`sms:${process.env.REACT_APP_TWILIO_SMS_NUMBER}`}
                      w="full"
                    >
                      Message support
                    </Button>
                  </VStack>
                </Card>
              </VStack>
            </VStack>
          </Container>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
