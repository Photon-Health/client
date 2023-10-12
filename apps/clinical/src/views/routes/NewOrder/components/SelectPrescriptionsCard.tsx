import {
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormErrorMessage,
  Heading,
  Text
} from '@chakra-ui/react';

import { FillsSelect } from '../../../components/FillsSelect';

interface SelectPrescriptionsCardProps {
  errors: any;
  touched: any;
  patientId: string;
  prescriptionIds: string[];
}

export const SelectPrescriptionsCard = ({
  errors,
  touched,
  patientId,
  prescriptionIds
}: SelectPrescriptionsCardProps) => {
  return (
    <Card bg="bg-surface">
      <CardHeader>
        <Heading size="xxs">Select Prescriptions</Heading>
      </CardHeader>
      <CardBody pt={0}>
        {patientId ? (
          <FormControl isInvalid={!!errors.fills && touched.fills}>
            <FillsSelect
              name="fills"
              patientId={patientId}
              initialFills={prescriptionIds || undefined}
            />
            <FormErrorMessage>{errors.fills}</FormErrorMessage>
          </FormControl>
        ) : (
          <Text>Select a patient to view their prescriptions.</Text>
        )}
      </CardBody>
    </Card>
  );
};
