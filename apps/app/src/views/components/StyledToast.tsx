import { Box, HStack, IconButton, Text, Icon, VStack } from '@chakra-ui/react';
import { FiCheckCircle, FiX, FiInfo, FiXCircle } from 'react-icons/fi';

type ToastType = 'success' | 'info' | 'error';
type ToastProps = {
  title?: string;
  description: string;
  type: ToastType;
  onClose: () => void;
};

const getColor = (type: ToastType) => {
  if (type === 'info') return 'blue.500';
  if (type === 'success') return 'green.500';
  if (type === 'error') return 'red.500';
  return 'blue.500';
};

const getIcon = (type: ToastType) => {
  if (type === 'info') return FiInfo;
  if (type === 'success') return FiCheckCircle;
  if (type === 'error') return FiXCircle;
  return FiInfo;
};

export const StyledToast = ({ title, description, type, onClose }: ToastProps) => {
  return (
    <Box
      color="gray.800"
      p={4}
      borderWidth="2px"
      borderRadius="md"
      bg="white"
      borderColor={getColor(type)}
      maxW="24rem"
      minW="18rem"
    >
      <HStack spacing={4}>
        <Icon as={getIcon(type)} color={getColor(type)} boxSize="5" />
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
