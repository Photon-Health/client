import { Card, HStack, Link, Radio, Text, VStack } from '@chakra-ui/react';
import { formatPhone } from '../../../../../../utils';

export const SendToPatient = ({ patient }: any) => {
  return patient ? (
    <VStack>
      <Text>
        Patient will receive a notification to select a pharmacy and will receive updates on the
        status of their prescription at the pharmacy.
      </Text>
      <Card mt={4} px={4} py={3} w="full">
        <HStack spacing={5}>
          <Radio isChecked />
          <VStack align="start" spacing={0} wordBreak="break-all">
            {patient.name ? <Text fontWeight="medium">{patient.name.full}</Text> : null}
            {patient.phone ? (
              <Link color="gray.500" href={`tel:${patient.phone}`} isExternal>
                {formatPhone(patient.phone)}
              </Link>
            ) : null}
            {patient.email ? (
              <Link color="gray.500" href={`mailto:${patient.email}`} isExternal>
                {patient.email}
              </Link>
            ) : null}
          </VStack>
        </HStack>
      </Card>
    </VStack>
  ) : (
    <Text>Select a patient to view this option.</Text>
  );
};
