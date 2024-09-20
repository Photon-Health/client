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
      <ModalContent backgroundColor={'gray.100'} as={VStack}>
        <ModalHeader maxW={'md'}>Frequently Asked Questions</ModalHeader>
        <ModalCloseButton />
        <ModalBody alignItems={'center'} as={VStack}>
          <VStack alignItems={'stretch'} spacing={4} maxW="md">
            <VStack bgColor="white" borderRadius="md" p={2} alignItems={'start'} w="full">
              <FAQContents />
            </VStack>

            <Heading as="h4" size="md">
              Still need help?
            </Heading>
            <Card>
              <VStack spacing={1} w="full">
                <Box>
                  If you have other pharmacy related questions, we are available 24/7 for support.
                  We typically respond within 30 minutes.
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
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
