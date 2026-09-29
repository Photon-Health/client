import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  FormControl,
  FormLabel,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Text,
  Textarea
} from '@chakra-ui/react';

import { PatientQuestion } from './requests';
import { suggestedQuestions } from './suggestedQuestions';

const OWN_QUESTION = 'own';

type AskPatientDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  patientFirstName: string;
  medication: string;
  onSend: (question: PatientQuestion) => Promise<void>;
};

export const AskPatientDrawer = ({
  isOpen,
  onClose,
  patientFirstName,
  medication,
  onSend
}: AskPatientDrawerProps) => {
  const suggestions = suggestedQuestions(medication);
  const [choice, setChoice] = useState(suggestions[0]?.key ?? OWN_QUESTION);
  const [ownText, setOwnText] = useState('');
  const [reason, setReason] = useState(suggestions[0]?.reason ?? '');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setChoice(suggestions[0]?.key ?? OWN_QUESTION);
      setReason(suggestions[0]?.reason ?? '');
      setOwnText('');
    }
    // Reset only when the drawer opens, not as the provider edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const choose = (key: string) => {
    setChoice(key);
    setReason(suggestions.find((s) => s.key === key)?.reason ?? '');
  };

  const suggestion = suggestions.find((s) => s.key === choice);
  const question: PatientQuestion | undefined = suggestion
    ? { key: suggestion.key, text: suggestion.text, reason: reason.trim() || null }
    : ownText.trim()
    ? { key: null, text: ownText.trim(), reason: reason.trim() || null }
    : undefined;

  const send = async () => {
    if (!question) return;
    setSending(true);
    try {
      await onSend(question);
      onClose();
    } finally {
      setSending(false);
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} placement="right" size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerHeader>
          <Text fontSize="xs" fontWeight="semibold" letterSpacing="wider" color="gray.500">
            ASK {patientFirstName.toUpperCase()} A QUESTION
          </Text>
          <Text fontSize="2xl" fontWeight="medium" mt={2}>
            What do you need to know?
          </Text>
        </DrawerHeader>
        <DrawerBody>
          <Stack spacing={6}>
            <RadioGroup value={choice} onChange={choose}>
              <Stack spacing={3}>
                {suggestions.map((s) => (
                  <Box key={s.key} borderWidth="1px" borderRadius="md" px={4} py={3}>
                    <Radio value={s.key}>{s.text}</Radio>
                  </Box>
                ))}
                <Box borderWidth="1px" borderRadius="md" px={4} py={3}>
                  <Radio value={OWN_QUESTION}>Write my own question</Radio>
                </Box>
              </Stack>
            </RadioGroup>
            {choice === OWN_QUESTION && (
              <FormControl>
                <FormLabel>Your question</FormLabel>
                <Input value={ownText} onChange={(e) => setOwnText(e.target.value)} />
              </FormControl>
            )}
            <FormControl>
              <FormLabel>Why you&apos;re asking (shown to patient)</FormLabel>
              <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
            </FormControl>
            <Box bg="gray.50" _dark={{ bg: 'gray.700' }} borderRadius="md" p={4}>
              <Text fontWeight="medium">Request stays claimed by you</Text>
              <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.300' }}>
                It moves to &ldquo;Waiting on patient&rdquo; until they answer.
              </Text>
            </Box>
          </Stack>
        </DrawerBody>
        <DrawerFooter gap={3}>
          <Button variant="outline" flex={1} onClick={onClose} isDisabled={sending}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            flex={1}
            onClick={send}
            isDisabled={!question}
            isLoading={sending}
          >
            Send question
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
