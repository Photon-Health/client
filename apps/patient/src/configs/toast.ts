import { UseToastOptions } from '@chakra-ui/react';

export const SUCCESS: UseToastOptions = {
  position: 'top',
  duration: 2000,
  isClosable: false
};
export const ERROR: UseToastOptions = {
  position: 'top',
  duration: 5000,
  isClosable: true
};
export const WARNING: UseToastOptions = {
  position: 'top',
  duration: 4000,
  isClosable: true
};
