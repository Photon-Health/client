import { Badge, VStack } from '@chakra-ui/react';
import { useStore } from '@nanostores/react';
import { usePhoton } from 'packages/react';
import { alertStore, hiddenCount } from '../../stores/alert';
import { Alert } from './Alert';

export const AlertDisplay = () => {
  const { isLoading } = usePhoton();
  const hidden = useStore(hiddenCount);
  const errors = useStore(alertStore);

  return !isLoading ? (
    <VStack
      w="full"
      gap="1"
      pt="2"
      position="fixed"
      zIndex={10}
      bottom={4}
      pr={4}
      pl={4}
      alignItems="flex-end"
    >
      {errors.map((err: any, idx: number) => (
        <Alert key={err.id} {...err} hide={idx > 1} />
      ))}
      {hidden > 0 ? (
        <Badge colorScheme="blue" borderWidth={1} borderColor="blue.700">
          {hidden} more alerts.
        </Badge>
      ) : null}
    </VStack>
  ) : null;
};
