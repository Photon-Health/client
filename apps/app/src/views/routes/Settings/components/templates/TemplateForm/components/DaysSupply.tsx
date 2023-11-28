import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper
} from '@chakra-ui/react';

import { Field, FieldProps } from 'formik';

interface DaysSupplyProps {
  errors: any;
  touched: any;
  hidden: boolean;
  setFieldValue: any;
}

export const DaysSupply = ({ errors, touched, hidden, setFieldValue }: DaysSupplyProps) => {
  return (
    <FormControl
      id="daysSupply"
      isInvalid={!!errors.daysSupply && touched.daysSupply}
      hidden={hidden}
    >
      <Field name="daysSupply" hidden={hidden}>
        {({ field }: FieldProps) => {
          return (
            <>
              <FormLabel htmlFor="daysSupply">Days Supply</FormLabel>
              <NumberInput
                id="daysSupply"
                min={0}
                {...field}
                onChange={(val: any) => setFieldValue(field.name, val)}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </>
          );
        }}
      </Field>
      <FormErrorMessage>{errors.daysSupply}</FormErrorMessage>
    </FormControl>
  );
};
