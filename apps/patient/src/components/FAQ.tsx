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
    question: 'What is the cost of the service?',
    answer:
      'The cost of the service is $10. And it is non-refundable. Also keep in mind that the cost of the service is $10. But be sure to know that the cost of the service is $10.'
  },
  {
    question: 'What is the cost of the service?',
    answer: 'The cost of the service is $10.'
  },
  {
    question: 'What is the cost of the service?',
    answer: 'The cost of the service is $10.'
  }
];

export const FAQ = () => {
  return (
    <Container pt={4} pb={1}>
      <Text align="start" fontWeight="semibold">
        Frequently Asked Questions
      </Text>
      <Accordion allowToggle allowMultiple>
        {questions.map(({ question, answer }, idx) => (
          <AccordionItem
            key={question}
            borderTopWidth={idx === 0 || idx === question.length - 1 ? 0 : 1}
            borderBottomColor="white"
          >
            <>
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
            </>
          </AccordionItem>
        ))}
      </Accordion>
    </Container>
  );
};
