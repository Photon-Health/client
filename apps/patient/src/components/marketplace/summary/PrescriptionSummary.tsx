import { Box, Collapse, Flex, Text, VStack } from '@chakra-ui/react';
import { useState } from 'react';
import { IoChevronDownOutline, IoChevronUpOutline } from 'react-icons/io5';
import { useOrderContext } from '../../../views/Main';

type PrescriptionSummaryProps = {
  providerName: string;
};

export function PrescriptionSummary({ providerName }: PrescriptionSummaryProps) {
  const [expanded, setExpanded] = useState(false);
  const { flattenedFills } = useOrderContext();
  const numberOfPrescriptions = flattenedFills.length;

  if (numberOfPrescriptions === 1) {
    return (
      <Text fontWeight="medium" className="mp-mask">
        {providerName} sent{' '}
        <Text as="span" fontWeight="bold">
          {flattenedFills[0].treatment.name}
        </Text>
      </Text>
    );
  }

  return (
    <Box w="full">
      <Text fontWeight="medium" className="mp-mask">
        {providerName} sent{' '}
        <Flex
          as="button"
          type="button"
          display="inline-flex"
          align="center"
          gap={1}
          verticalAlign="baseline"
          color="blue.500"
          fontWeight="bold"
          fontSize="inherit"
          lineHeight="inherit"
          p={0}
          m={0}
          border="none"
          bg="transparent"
          cursor="pointer"
          appearance="none"
          sx={{ WebkitAppearance: 'none' }}
          onClick={() => setExpanded((isExpanded) => !isExpanded)}
          aria-expanded={expanded}
        >
          {numberOfPrescriptions} prescriptions
          {expanded ? <IoChevronUpOutline /> : <IoChevronDownOutline />}
        </Flex>
      </Text>
      <Collapse in={expanded} animateOpacity>
        <VStack align="start" spacing={0.5} pl={2} pt={1}>
          {flattenedFills.map((fill) => (
            <Text key={fill.id} fontSize="sm">
              {fill.treatment.name}
            </Text>
          ))}
        </VStack>
      </Collapse>
    </Box>
  );
}
