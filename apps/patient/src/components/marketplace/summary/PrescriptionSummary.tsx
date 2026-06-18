import { Button, Collapse, Text, VStack } from '@chakra-ui/react';
import { useState } from 'react';
import { IoChevronDownOutline, IoChevronUpOutline } from 'react-icons/io5';
import { useOrderContext } from '../../../views/Main';

export function PrescriptionSummary() {
  const [expanded, setExpanded] = useState(false);
  const { flattenedFills } = useOrderContext();
  const numberOfPrescriptions = flattenedFills.length;

  if (numberOfPrescriptions === 1) {
    return (
      <Text as="span">
        {' '}
        <Text as="span" fontWeight="bold">
          {flattenedFills[0].treatment.name}
        </Text>
      </Text>
    );
  }

  return (
    <VStack align="start" spacing={1}>
      <Button
        variant="link"
        size="sm"
        color="blue.500"
        fontWeight="bold"
        p={0}
        h="auto"
        minH={0}
        rightIcon={expanded ? <IoChevronUpOutline /> : <IoChevronDownOutline />}
        onClick={() => setExpanded((isExpanded) => !isExpanded)}
        aria-expanded={expanded}
      >
        {numberOfPrescriptions} prescriptions
      </Button>
      <Collapse in={expanded} animateOpacity>
        <VStack align="start" spacing={0.5} pl={2}>
          {flattenedFills.map((fill) => (
            <Text key={fill.id} fontSize="sm">
              {fill.treatment.name}
            </Text>
          ))}
        </VStack>
      </Collapse>
    </VStack>
  );
}
