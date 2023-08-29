import { StarIcon } from '@chakra-ui/icons';
import {
  Card,
  HStack,
  Link,
  Radio,
  Tag,
  TagLabel,
  TagLeftIcon,
  Text,
  VStack
} from '@chakra-ui/react';
import { formatAddress, formatPhone } from '../../../../../../utils';

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
            {(patient?.preferredPharmacies?.length ?? 0) > 0 ? (
              <>
                <Text fontSize="sm" color="gray.500">
                  {patient?.preferredPharmacies?.[0]?.name}{' '}
                  <Tag size="sm" colorScheme="blue" mb={1} me={1}>
                    <TagLeftIcon boxSize="12px" as={StarIcon} />
                    <TagLabel>Preferred</TagLabel>
                  </Tag>
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {formatAddress(patient?.preferredPharmacies?.[0]?.address)}
                </Text>
              </>
            ) : (
              <>
                {patient.phone ? (
                  <Link fontSize="sm" color="gray.500" href={`tel:${patient.phone}`} isExternal>
                    {formatPhone(patient.phone)}
                  </Link>
                ) : null}
                {patient.email ? (
                  <Link fontSize="sm" color="gray.500" href={`mailto:${patient.email}`} isExternal>
                    {patient.email}
                  </Link>
                ) : null}
              </>
            )}
          </VStack>
        </HStack>
      </Card>
    </VStack>
  ) : (
    <Text>Select a patient to view this option.</Text>
  );
};
