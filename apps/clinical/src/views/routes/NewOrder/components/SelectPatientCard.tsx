import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormErrorMessage,
  Heading
} from '@chakra-ui/react';

import { PatientSelect } from '../../../components/PatientSelect';

interface PatientCardProps {
  errors: any;
  touched: any;
}

export const SelectPatientCard = ({ errors, touched }: PatientCardProps) => {
  const navigate = useNavigate();
  return (
    <Card bg="bg-surface">
      <CardHeader>
        <Heading size="xxs">Select a Patient</Heading>
      </CardHeader>
      <CardBody pt={0}>
        <FormControl isInvalid={!!errors.patientId && touched.patientId}>
          <PatientSelect
            autoFocus
            name="patientId"
            onChange={(value: any) => navigate(`/orders/new?patientId=${value}`)}
          />
          <FormErrorMessage>{errors.patientId}</FormErrorMessage>
        </FormControl>
      </CardBody>
    </Card>
  );
};
