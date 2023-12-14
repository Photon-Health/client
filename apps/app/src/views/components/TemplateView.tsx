import { Badge, Divider, Flex, Heading, HStack, Stack, Text, VStack } from '@chakra-ui/react';
import CopyText from './CopyText';

interface TemplateViewProps {
  template: {
    name: string | null;
    isPrivate: boolean;
    id: string;
    treatment: { name: string };
    fillsAllowed?: number | null;
    dispenseUnit?: string | null;
    dispenseQuantity?: number | null;
    daysSupply?: number | null;
    dispenseAsWritten?: boolean | null;
    instructions?: string | null;
    notes?: string | null;
  };
}

export const TemplateView = (props: TemplateViewProps) => {
  const { template } = props;

  return (
    <Stack
      direction={{ base: 'column', md: 'row' }}
      spacing={{ base: '3', md: '10' }}
      align="justify-start"
    >
      <Flex>
        <VStack spacing="4" fontSize={{ base: 'md', md: 'lg' }} alignItems="start">
          <Heading as={'div'} size="xxs">
            <Heading as="div" size="xs">
              {template.name}
            </Heading>
            {template.treatment.name}
          </Heading>
          <Stack
            direction={{ base: 'column', md: 'row' }}
            alignItems={{ base: 'start', md: 'center' }}
          >
            <Badge colorScheme={props.template.isPrivate ? 'blue' : 'purple'}>
              {props.template.isPrivate ? 'Personal' : 'Organization'}
            </Badge>
            <Text fontSize="xs" fontWeight="bold">
              TEMPLATE ID
            </Text>
            <CopyText size="sm" text={template.id} />
          </Stack>
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
