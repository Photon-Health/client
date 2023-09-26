import {
  Button,
  Image,
  Modal,
  ModalHeader,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Text,
  VStack
} from '@chakra-ui/react';

import image from '../assets/conversation.png';

export const DemoCtaModal = ({ isOpen }: { isOpen: boolean }) => {
  const handleCtaClick = () => {
    window.open('https://www.photon.health/sign-up');
  };

  return (
    <Modal isOpen={isOpen} onClose={() => {}}>
      <ModalOverlay />
      <ModalContent>
        <ModalBody>
          <Image src={image} width="auto" height="120px" mx="auto" pt={6} />
        </ModalBody>
        <ModalHeader alignSelf="center">Take your time back</ModalHeader>
        <ModalBody pb={6}>
          <VStack spacing={1} align="stretch" textAlign="center" w="full">
            <Text align="start">
              Send prescriptions with Photon and let your patients manage their own orders. So your
              doctors can get back to being doctors. You know, how prescriptions should work.
            </Text>
            <Text mt={5} fontSize="sm">
              30 day free trial
            </Text>
            <Button w="full" size="lg" variant="brand" onClick={handleCtaClick}>
              Try it out
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
