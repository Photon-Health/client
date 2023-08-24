import { UseToastOptions } from '@chakra-ui/react';

export const SUCCESS: UseToastOptions = {
  status: 'success',
  position: 'top',
  duration: 2000,
  isClosable: false
};
export const ERROR: UseToastOptions = {
  status: 'error',
  position: 'top',
  duration: 5000,
  isClosable: true
};
export const WARNING: UseToastOptions = {
  status: 'warning',
  position: 'top',
  duration: 4000,
  isClosable: true
};
