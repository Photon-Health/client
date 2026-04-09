import { ReactNode } from 'react';
import { Box, HStack, Text, VStack } from '@chakra-ui/react';
import { formatDate } from '../../utils/formatters';
import { FillWithCount } from '../../utils/general';

interface FillSummaryProps {
  fill: FillWithCount;
  expanded?: boolean;
}

export function FillSummary({ fill, expanded = false }: FillSummaryProps) {
  return (
    <Box>
      <Box py={2} px={3} borderBottom={expanded ? '1px' : '0'} borderColor="gray.200">
        <Text
          textOverflow="ellipsis"
          whiteSpace="nowrap"
          overflowX="hidden"
          title={fill.treatment.name}
        >
          {fill.treatment.name}
        </Text>
      </Box>
      <Box
        as="div"
        maxHeight={expanded ? '80px' : '0px'}
        opacity={expanded ? '100%' : '0'}
        transitionProperty={'all'}
        transitionDuration={'150ms'}
        transitionTimingFunction={expanded ? 'linear' : 'ease-out'}
      >
        <VStack background="gray.50" px={3} py={2}>
          <HStack w="full" justifyContent="space-between">
            <FillDescriptor label="Quantity">{fill.prescription?.dispenseQuantity}</FillDescriptor>
            <FillDescriptor label="Days Supply">{fill.prescription?.daysSupply}</FillDescriptor>
          </HStack>
          <HStack w="full" justifyContent="space-between">
            <FillDescriptor label="Refills">{fill.count - 1}</FillDescriptor>
            <FillDescriptor label="Expires">
              {formatDate(fill.prescription?.expirationDate)}
            </FillDescriptor>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
}

function FillDescriptor({ label, children }: { label: string; children: ReactNode }) {
  return (
    <HStack>
      <Text as="span">{label}</Text>
      <Text as="span" fontWeight="medium">
        {children}
      </Text>
    </HStack>
  );
}
