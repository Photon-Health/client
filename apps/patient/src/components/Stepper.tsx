import React from 'react';
import { Text } from '@chakra-ui/react';

interface StepperProps {
  currentStep: number;
}

const TOTAL_STEPS = 3;

/**
 * Stepper component displays the current step in a multi-step flow, e.g. 'STEP 1 of 3'.
 */
export const Stepper: React.FC<StepperProps> = ({ currentStep }) => {
  return (
    <Text color="gray.500" fontWeight="semibold" fontSize="xs">
      STEP {currentStep} of {TOTAL_STEPS}
    </Text>
  );
};
