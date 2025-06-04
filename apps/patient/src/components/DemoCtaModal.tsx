import {
  Button,
  Image,
  Modal,
  ModalCloseButton,
  ModalHeader,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Text,
  ModalFooter
} from '@chakra-ui/react';

import image from '../assets/conversation.png';

interface DemoCtaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoCtaModal = ({ isOpen, onClose }: DemoCtaModalProps) => {
  const handleCtaClick = () => {
    const caseStudyLink =
      'https://blog.photon.health/how-found-scaled-access-to-personalized-weight-loss-treatment-with-photon';
    window.open(caseStudyLink);
  };

  return (
    <Modal isOpen={isOpen} onClose={() => {}}>
      <ModalOverlay />
      <ModalContent>
        <ModalBody>
          <Image src={image} width="auto" height="120px" mx="auto" pt={6} />
        </ModalBody>
        <ModalCloseButton onClick={onClose} />
        <ModalHeader alignSelf="center">Empower Rx access while protecting your time</ModalHeader>
        <ModalBody>
          <Text>
            By prescribing with Photon, you unlock transparency, choice, and support that patients
            love. And, you offload pharmacy issues to us, removing up to 70% of Rx requests and
            saving 2 hours weekly per prescriber.
          </Text>
        </ModalBody>
        <ModalFooter>
          <Button w="full" size="lg" variant="brand" onClick={handleCtaClick}>
            Learn more
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
