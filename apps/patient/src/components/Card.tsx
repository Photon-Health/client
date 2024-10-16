import { VStack } from '@chakra-ui/react';
import React from 'react';

export const Card = (props: { children: React.ReactNode | React.ReactNode[] }) => {
  return (
    <VStack bgColor="white" borderRadius="2xl" p={4} alignItems={'start'} spacing={5} w="full">
      {props.children}
    </VStack>
  );
};
