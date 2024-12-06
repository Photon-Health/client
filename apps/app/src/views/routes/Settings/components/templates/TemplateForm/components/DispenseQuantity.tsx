import {
  Button,
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
import { BsCalculator } from 'react-icons/bs';

interface DispenseQuantityProps {
  errors: any;
  touched: any;
  quantityRef: any;
  setFieldValue: any;
  hidden: boolean;
  setDoseCalcVis: (b: boolean) => void;
}

export const DispenseQuantity = ({
  errors,
  touched,
  quantityRef,
  setFieldValue,
  hidden,
  setDoseCalcVis
}: DispenseQuantityProps) => {
  return (
    <FormControl
      id="dispenseQuantity"
      isInvalid={!!errors.dispenseQuantity && touched.dispenseQuantity}
    >
      <Field name="dispenseQuantity">
        {({ field }: FieldProps) => {
          return (
            <>
              <FormLabel htmlFor="dispenseQuantity">Quantity</FormLabel>
              <NumberInput
                id="dispenseQuantity"
                ref={quantityRef}
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
      <FormErrorMessage>{errors.dispenseQuantity}</FormErrorMessage>
      <Button
        leftIcon={<BsCalculator />}
        hidden={hidden}
        onClick={() => setDoseCalcVis(true)}
        mt={2}
      >
        Dose Calculator
      </Button>
    </FormControl>
  );
};
