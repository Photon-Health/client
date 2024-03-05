import React, { ReactElement } from 'react';
import { Stack, Text, Divider, VStack } from '@chakra-ui/react';

type SectionTitleRowProps = {
  headerText: string;
  subHeaderText?: string;
  rightElement?: ReactElement;
};

const SectionTitleRow: React.FC<SectionTitleRowProps> = ({
  headerText,
  subHeaderText,
  rightElement
}) => {
  return (
    <VStack spacing={4} width="100%" mt={4}>
      <Stack
        direction={{ base: 'column', md: 'row' }}
        align={{ base: 'start', md: 'stretch' }}
        justify="space-between"
        width="full"
        alignItems={{ base: 'start', md: 'center' }}
      >
        <VStack align="start" spacing={0} mt={0}>
          <Text fontWeight="medium" fontSize="lg">
            {headerText}
          </Text>
          {subHeaderText ? <Text fontSize="sm">{subHeaderText}</Text> : null}
        </VStack>
        {rightElement}
      </Stack>
      <Divider />
    </VStack>
  );
};

export default SectionTitleRow;
