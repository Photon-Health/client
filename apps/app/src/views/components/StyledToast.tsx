import { Box, HStack, IconButton, Text, Icon, VStack } from '@chakra-ui/react';
import { FiCheckCircle, FiX, FiInfo } from 'react-icons/fi';

type ToastType = 'success' | 'info';
type ToastProps = {
  title?: string;
  description: string;
  type: ToastType;
  onClose: () => void;
};

export const StyledToast = ({ title, description, type, onClose }: ToastProps) => {
  return (
    <Box
      color="gray.800"
      p={4}
      borderWidth="2px"
      borderRadius="md"
      bg="white"
      borderColor={type === 'info' ? 'blue.500' : 'green.500'}
      maxW="24rem"
      minW="18rem"
    >
      <HStack spacing={4}>
        {type === 'info' ? (
          <Icon as={FiInfo} color="blue.500" boxSize="5" />
        ) : (
          <Icon as={FiCheckCircle} color="green.500" boxSize="5" />
        )}
        <VStack spacing={1} align="flex-start" flex={1}>
          {title && (
            <Text as="b" align="left">
              {title}
            </Text>
          )}
          <Text align="left">{description}</Text>
        </VStack>
        <IconButton
          color="muted"
          icon={<FiX fontSize="1.25rem" />}
          variant="ghost"
          aria-label="close"
          title="Close"
          onClick={onClose}
        />
      </HStack>
    </Box>
  );
};
