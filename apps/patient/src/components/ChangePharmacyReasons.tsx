import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerProps,
  Heading,
  Textarea,
  useBreakpointValue,
  VStack
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';

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
  const placement = useBreakpointValue({ base: 'bottom', md: 'right' }, { fallback: 'bottom' });
  const [screen, setScreen] = useState(Screen.Reasons);

  useEffect(() => {
    // Reset state when drawer is toggled
    setScreen(Screen.Reasons);
  }, [isOpen]);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      placement={placement as DrawerProps['placement']}
      size={placement === 'bottom' ? '' : 'sm'}
    >
      <DrawerOverlay />
      <DrawerContent borderTopRadius={placement === 'bottom' ? 'xl' : 'none'}>
        <DrawerCloseButton onClick={onClose} />
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
      </DrawerContent>
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
    <>
      <DrawerHeader pt={6}>
        <Heading as="h4" size="md">
          Let us know why you want to change pharmacies
        </Heading>
      </DrawerHeader>
      <DrawerBody pb={6}>
        <VStack spacing={2}>
          {reasons.map((reason) => {
            return <ReasonButton key={reason} reason={reason} onClick={() => onSelect(reason)} />;
          })}
          <ReasonButton reason={SOMETHING_ELSE_REASON} onClick={onSomethingElse} />
        </VStack>
      </DrawerBody>
    </>
  );
};

const SomethingElseScreen = ({ onSubmit }: { onSubmit: (otherReason: string) => void }) => {
  const [text, setText] = useState('');

  return (
    <>
      <DrawerHeader pt={6}>
        <Heading as="h4" size="md">
          Tell us about your pharmacy issue
        </Heading>
      </DrawerHeader>
      <DrawerBody>
        <Textarea
          placeholder="Please describe your issue..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
        />
      </DrawerBody>
      <DrawerFooter pb={6}>
        <Button
          w="full"
          colorScheme="blue"
          isDisabled={text.trim() === ''}
          onClick={() => onSubmit(text)}
        >
          Continue
        </Button>
      </DrawerFooter>
    </>
  );
};
