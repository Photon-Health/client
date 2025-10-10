import { Heading, SlideFade, Text, VStack } from '@chakra-ui/react';

export const BrandedOptionsHeader = ({
  title,
  description
}: {
  title: string;
  description: string;
}) => {
  return (
    <VStack spacing={2} align="span" w="full">
      <SlideFade offsetY="60px" in={true}>
        <VStack spacing={1} align="start">
          <Heading as="h5" size="sm">
            {title}
          </Heading>
          <Text size="sm">{description}</Text>
        </VStack>
      </SlideFade>
    </VStack>
  );
};
