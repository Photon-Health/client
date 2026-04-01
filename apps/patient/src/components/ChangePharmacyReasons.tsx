import {
  Box,
  Button,
  CloseButton,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  Heading,
  Modal,
  ModalContent,
  ModalOverlay,
  Textarea,
  useBreakpointValue,
  VStack
} from '@chakra-ui/react';
import { ReactNode, useEffect, useState } from 'react';
import { useOrderContext } from '../views/Main';
import { usePatientAnalytics } from '../hooks/usePatientAnalytics';

enum Screen {
  Reasons = 'reasons',
  SomethingElse = 'something-else'
}

const SOMETHING_ELSE_REASON = 'Something else';

interface ChangePharmacyReasonsProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (reason: string, otherReason?: string) => void;
}

export const ChangePharmacyReasons = ({
  isOpen,
  onClose,
  onSelect
}: ChangePharmacyReasonsProps) => {
  const { order } = useOrderContext();
  const [screen, setScreen] = useState(Screen.Reasons);
  const patientAnalytics = usePatientAnalytics();

  useEffect(() => {
    if (isOpen) {
      patientAnalytics.track(
        'Pharmacy Change Reasons Viewed',
        order,
        {},
        { toRudderStack: false, toMixpanel: true }
      );
    }
    // Reset state when drawer is toggled
    setScreen(Screen.Reasons);
  }, [isOpen]);

  return (
    <Container isOpen={isOpen} onClose={onClose}>
      <CloseButton position={'absolute'} top={2} right={3} onClick={onClose} />
      {screen === Screen.Reasons && (
        <ReasonsScreen
          onSelect={onSelect}
          onSomethingElse={() => setScreen(Screen.SomethingElse)}
        />
      )}
      {screen === Screen.SomethingElse && (
        <SomethingElseScreen
          onSubmit={(otherReason) => onSelect(SOMETHING_ELSE_REASON, otherReason)}
        />
      )}
    </Container>
  );
};

const Container = ({
  isOpen,
  onClose,
  children
}: {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}) => {
  const container = useBreakpointValue({ base: 'drawer', md: 'modal' }) || 'drawer';
  const borderRadius = 'xl';

  if (container === 'modal') {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent borderRadius={borderRadius}>{children}</ModalContent>
      </Modal>
    );
  }

  return (
    <Drawer isOpen={isOpen} onClose={onClose} placement={'bottom'}>
      <DrawerOverlay />
      <DrawerContent borderTopRadius={borderRadius}>{children}</DrawerContent>
    </Drawer>
  );
};

const ReasonButton = ({ reason, onClick }: { reason: string; onClick: () => void }) => (
  <Button
    size="md"
    py={6}
    variant="outline"
    w="full"
    fontWeight="medium"
    justifyContent="flex-start"
    onClick={onClick}
  >
    {reason}
  </Button>
);

const ReasonsScreen = ({
  onSelect,
  onSomethingElse
}: {
  onSelect: (reason: string) => void;
  onSomethingElse: () => void;
}) => {
  const reasons = [
    'Closer pharmacy location',
    'Pharmacy hours/pharmacy not open',
    'Prescription not in stock',
    'Fill time too slow',
    "Pharmacy doesn't take my insurance",
    'Cost is too high',
    'Incorrect pharmacy selected'
  ];

  return (
    <Box p={6}>
      {/* pr prevents heading from overlapping w CloseButton */}
      <Heading as="h4" size="md" pb={6} pr={7}>
        Let us know why you want to change pharmacies
      </Heading>
      <VStack spacing={2}>
        {reasons.map((reason) => {
          return <ReasonButton key={reason} reason={reason} onClick={() => onSelect(reason)} />;
        })}
        <ReasonButton reason={SOMETHING_ELSE_REASON} onClick={onSomethingElse} />
      </VStack>
    </Box>
  );
};

const SomethingElseScreen = ({ onSubmit }: { onSubmit: (otherReason: string) => void }) => {
  const [text, setText] = useState('');

  return (
    <VStack p={6} spacing={6} alignItems={'start'}>
      {/* pr prevents heading from overlapping w CloseButton */}
      <Heading as="h4" size="md" pr={7}>
        Tell us about your pharmacy issue
      </Heading>
      <Textarea
        placeholder="Please describe your issue..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
      />
      <Button
        w="full"
        colorScheme="blue"
        isDisabled={text.trim() === ''}
        onClick={() => onSubmit(text)}
      >
        Continue
      </Button>
    </VStack>
  );
};
