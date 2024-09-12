import {
  Box,
  Button,
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
    <Modal onClose={onClose} isOpen={isOpen} size="full" motionPreset="slideInBottom">
      <ModalOverlay />
      <ModalContent backgroundColor={'gray.100'}>
        <ModalHeader>Frequently Asked Questions</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack alignItems={'stretch'} spacing={4}>
            <VStack bgColor="white" borderRadius="md" p={2} alignItems={'start'}>
              <FAQContents />
            </VStack>

            <Heading as="h4" size="md">
              Still need help?
            </Heading>
            <Card>
              <Box>
                If you have other pharmacy related questions, we are available 24/7 for support. We
                typically respond within 30 minutes.
              </Box>
              <Button
                as="a"
                variant="outline"
                color="blue.500"
                href={`sms:${process.env.REACT_APP_TWILIO_SMS_NUMBER}`}
              >
                Message support
              </Button>
            </Card>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
