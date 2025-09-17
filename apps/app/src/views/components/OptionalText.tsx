import { Text } from '@chakra-ui/react';

interface OptionalTextProps {
  text?: string;
}

export const OptionalText = ({ text = 'Optional' }: OptionalTextProps) => {
  return (
    <Text color="gray.400" fontSize="xs" display="inline-block" ms={2}>
      {text}
    </Text>
  );
};
