import React, { ReactElement } from 'react';
import { Stack, Text, Divider, VStack } from '@chakra-ui/react';

type SectionTitleRowProps = {
  headerText: string;
  subHeaderText?: string;
  rightElement?: ReactElement | undefined;
};

const SectionTitleRow: React.FC<SectionTitleRowProps> = ({
  headerText,
  subHeaderText,
  rightElement
}) => {
  return (
    <VStack spacing={4} width="100%">
      <Stack
        direction={{ base: 'column', md: 'row' }}
        align={{ base: 'start', md: 'stretch' }}
        pt={5}
        justify="space-between"
        width="full"
        alignItems={{ base: 'start', md: 'center' }}
      >
        <VStack align="start" spacing={0}>
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
