import { Button, Heading, HStack, Text, VStack } from '@chakra-ui/react';
import { useState } from 'react';
import { useOrderContext } from '../../views/Main';
import { FillSummary } from './FillSummary';
import { usePatientAnalytics } from '../../hooks/usePatientAnalytics';

export function PrescriptionsSummary() {
  const [expanded, setExpanded] = useState(false);

  const patientAnalytics = usePatientAnalytics();
  const { order, flattenedFills } = useOrderContext();

  const toggleDetails = () => {
    const eventName = `${expanded ? 'Hide' : 'View'} Prescription Details Clicked`;
    patientAnalytics.track(
      eventName,
      order,
      {
        multiMedOrder: flattenedFills.length > 1,
        medNames: flattenedFills.map((fill) => fill.treatment.name)
      },
      { toMixpanel: true, toRudderStack: false }
    );

    setExpanded(!expanded);
  };

  return (
    <VStack spacing={2} alignItems="start">
      <HStack w="full" justifyContent="space-between">
        <Heading as="h3" size="lg">
          Prescriptions
        </Heading>
        <Button size="sm" onClick={toggleDetails}>
          {expanded ? 'Hide' : 'View'} Details
        </Button>
      </HStack>
      <HStack spacing="1.5">
        <Text>Patient</Text>
        <Text fontWeight="medium">{order.patient.name.full}</Text>
      </HStack>
      {flattenedFills.map((fill) => (
        <FillSummary key={fill.id} fill={fill} expanded={expanded} />
      ))}
    </VStack>
  );
}
