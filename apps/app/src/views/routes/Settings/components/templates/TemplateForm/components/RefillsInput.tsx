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

interface RefillsInputProps {
  errors: any;
  touched: any;
  hidden: boolean;
  setFieldValue: any;
}

export const RefillsInput = ({ errors, touched, hidden, setFieldValue }: RefillsInputProps) => {
  return (
    <FormControl
      id="refillsInput"
      isInvalid={!!errors.refillsInput && touched.refillsInput}
      hidden={hidden}
    >
      <Field name="refillsInput">
        {({ field }: FieldProps) => {
          return (
            <>
              <FormLabel htmlFor="refillsInput">Refills</FormLabel>
              <NumberInput
                id="refillsInput"
                min={0}
                {...field}
                onChange={(val: string) => setFieldValue(field.name, Number(val))}
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
      <FormErrorMessage>{errors.refillsInput}</FormErrorMessage>
    </FormControl>
  );
};
