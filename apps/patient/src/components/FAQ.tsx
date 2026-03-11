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
import { useFaqQuestions, useText } from '../hooks/useText';

export const FAQContents = () => {
  const questions = useFaqQuestions();

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
  const t = useText();
  return (
    <Container pt={4} pb={1}>
      <Text align="start" fontWeight="semibold">
        {t.faqTitle}
      </Text>
      <FAQContents />
    </Container>
  );
};
