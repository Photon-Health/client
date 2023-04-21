import {
  Divider,
  Flex,
  Heading,
  HStack,
  Stack,
  Text,
  VStack,
  useClipboard,
  Button
} from '@chakra-ui/react';

interface TemplateViewProps {
  template: {
    id: string;
    treatment: {
      name: string;
    };
    fillsAllowed?: number;
    dispenseUnit?: string;
    dispenseQuantity?: number;
    daysSupply?: number;
    dispenseAsWritten?: boolean;
    instructions?: string;
    notes?: string;
  };
}

export const TemplateView = (props: TemplateViewProps) => {
  const { template } = props;
  const { onCopy, hasCopied } = useClipboard(template.id);

  return (
    <Stack
      direction={{ base: 'column', md: 'row' }}
      spacing={{ base: '3', md: '10' }}
      align="justify-start"
    >
      <Flex>
        <VStack spacing="4" fontSize={{ base: 'md', md: 'lg' }} alignItems="start">
          <Heading as="h6" size="xs">
            {template.treatment.name}
          </Heading>
          <HStack>
            <Text fontSize="xs" fontWeight="bold">
              TEMPLATE ID
            </Text>
            <Text fontSize="sm">{template.id}</Text>
            <Button size="xs" onClick={onCopy}>
              {hasCopied ? 'Copied!' : 'Copy'}
            </Button>
          </HStack>
          <Heading as="h6" size="xxs" paddingTop={4}>
            Details
          </Heading>
          <Divider />
          <HStack>
            <Text fontWeight="medium" fontSize="sm">
              Refills Allowed
            </Text>
            {/* We are showing the number of Refills in this view and therefore have to have a -1 here */}
            <Text fontSize="sm">{template.fillsAllowed ? template.fillsAllowed - 1 : 0}</Text>
          </HStack>
          <HStack>
            <Text fontWeight="medium" fontSize="sm">
              Dispense Unit
            </Text>
            <Text fontSize="sm">{template.dispenseUnit}</Text>
          </HStack>
          <HStack>
            <Text fontWeight="medium" fontSize="sm">
              Quantity
            </Text>
            <Text fontSize="sm">
              {template.dispenseQuantity} ct / {template.daysSupply} day
            </Text>
          </HStack>
          <HStack>
            <Text fontWeight="medium" fontSize="sm">
              Dispense As Written
            </Text>
            <Text fontSize="sm">{template.dispenseAsWritten ? 'Yes' : 'No'}</Text>
          </HStack>
          <Heading as="h6" size="xxs" pt={4}>
            Instructions
          </Heading>
          <Divider />
          <HStack>
            <Text fontSize="sm">{template.instructions}</Text>
          </HStack>
          <Heading as="h6" size="xxs" pt={4}>
            Notes
          </Heading>
          <Divider />
          <HStack>
            <Text fontSize="sm" color="muted">
              {template.notes}
            </Text>
          </HStack>
        </VStack>
      </Flex>
    </Stack>
  );
};
