import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Container,
  HStack,
  Link,
  Text
} from '@chakra-ui/react';
import { ReactNode } from 'react';

export type FAQEntry = {
  question: string;
  answer: string;
};

// Renders the answer text with inline markdown-style links: [label](url).
// Anything outside the link syntax is rendered as plain text.
// If we need more complex markdown rendering, we can consider adding react-markdown.
const LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g;
const renderAnswersWithLinks = (answer: string): ReactNode[] => {
  // Split [label](url) groupings into parts: [text, label, url, text, label, url, ...]
  const parts = answer.split(LINK_PATTERN);
  const nodes: ReactNode[] = [];
  for (let i = 0; i < parts.length; i += 3) {
    if (parts[i]) nodes.push(parts[i]);
    if (i + 2 < parts.length) {
      nodes.push(
        <Link key={i} href={parts[i + 2]}>
          {parts[i + 1]}
        </Link>
      );
    }
  }
  return nodes;
};

export const FAQContents = ({ faqs }: { faqs: FAQEntry[] }) => {
  return (
    <Accordion allowToggle w="full">
      {faqs.map(({ question, answer }, idx) => (
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
              {renderAnswersWithLinks(answer)}
            </Text>
          </AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export const FAQ = ({ faqs }: { faqs: FAQEntry[] }) => {
  return (
    <Container pt={4} pb={1}>
      <Text align="start" fontWeight="semibold">
        Frequently Asked Questions
      </Text>
      <FAQContents faqs={faqs} />
    </Container>
  );
};
