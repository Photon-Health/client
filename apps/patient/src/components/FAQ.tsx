import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Container,
  HStack,
  Text
} from '@chakra-ui/react';

const questions = [
  {
    question: 'Can I re-route my prescription or do I need to contact my doctor?',
    answer:
      'You can reroute your prescription using the Photon tracking link provided to you, as long as it has not been confirmed at the pharmacy. If the prescription has been confirmed, you need to contact Photon Support directly via text at 513-866-3212 for assistance.'
  },
  {
    question: 'Can I pay Photon directly for my prescription?',
    answer:
      'No, you cannot pay Photon Health directly for your prescriptions. Payments are made at the local pharmacy when picking up medications, or directly to the provider organization or pharmacy if using a mail order service.'
  },
  {
    question: 'Can Photon ask my doctor to update my prescription?',
    answer:
      'We can relay issues to your provider regarding your prescription. However, for any clinical issues, including requests for new prescriptions, we recommend contacting your provider organization directly.'
  },
  {
    question: 'Does Photon write prescriptions?',
    answer:
      'No, Photon Health does not write or provide prescriptions. We are a prescription routing company, and all prescriptions are written by healthcare providers using our tools. Our role is to manage the pharmacy experience for patients.'
  },
  {
    question: 'How does Photon Health work?',
    answer:
      "Photon Health provides prescribing tools that help send prescriptions to a patient's preferred pharmacy. Doctor's offices handle all clinical aspects and address company-related inquiries. Photon Health supports the process by ensuring prescriptions are received and processed promptly, updating patients, and resolving any issues by coordinating with the pharmacy and the provider."
  }
];

export const FAQContents = () => {
  return (
    <Accordion allowToggle w="full">
      {questions.map(({ question, answer }, idx) => (
        <AccordionItem
          key={question}
          borderTopWidth={idx === 0 || idx === question.length - 1 ? 0 : 1}
          borderBottomColor="white"
        >
          <AccordionButton px={0} py={3}>
            <HStack justifyContent="space-between" w="full">
              <Text align="start" color="gray.900">
                {question}
              </Text>
              <AccordionIcon />
            </HStack>
          </AccordionButton>
          <AccordionPanel px={0} pb={4}>
            <Text align="start" color="gray.900">
              {answer}
            </Text>
          </AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export const FAQ = () => {
  return (
    <Container pt={4} pb={1}>
      <Text align="start" fontWeight="semibold">
        Frequently Asked Questions
      </Text>
      <FAQContents />
    </Container>
  );
};
