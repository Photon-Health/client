import {
  // Button,
  // Flex,
  // FormControl,
  // FormLabel,
  HStack,
  // Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text
} from '@chakra-ui/react';
// import { Field, Formik } from 'formik';

// const initialValues = {
//   input: {
//     dosage: {
//       value: 0,
//       unit: 'mg/kg'
//     },
//     weight: {
//       value: 0,
//       unit: 'lb'
//     }
//   },
//   liquid_formation: {
//     drug_amount: {
//       value: 0,
//       unit: 'mg'
//     },
//     per_volume: {
//       value: 0,
//       unit: 'mL'
//     }
//   }
// };

export const TicketModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}}
      size="xl"
      closeOnOverlayClick={false}
      closeOnEsc={false}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <Text flex="1">Paul's modal</Text>
            <ModalCloseButton right="4" top="4" left="unset" onClick={onClose} />
          </HStack>
        </ModalHeader>
        <ModalBody>
          HELOL
          {/* <Formik initialValues={initialValues} onSubit={() => {}}>
            {() => {
              return (
                <Flex justifyContent="center">
                  hello {isOpen ? 'open' : 'closed'}
                  <Button
                    px={6}
                    fontSize="md"
                    colorScheme="brand"
                    onClick={() => {
                      onClose();
                    }}
                  >
                    Close
                  </Button>
                </Flex>
              );
            }}
          </Formik> */}
        </ModalBody>
        <ModalFooter px="0" />
      </ModalContent>
    </Modal>
  );
};
