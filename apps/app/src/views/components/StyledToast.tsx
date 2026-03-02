import { Box, HStack, IconButton, Text, Icon, VStack } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';

type ToastType = 'success' | 'info' | 'error';
type ToastProps = {
  title?: string;
  description: ReactNode;
  type: ToastType;
  onClose: () => void;
};

const getColors = (type: ToastType) => {
  let colorBase = 'blue';

  switch (type) {
    case 'info':
      colorBase = 'blue';
      break;
    case 'success':
      colorBase = 'green';
      break;
    case 'error':
      colorBase = 'red';
      break;
    default:
      colorBase = 'blue';
      break;
  }

  return {
    border: `${colorBase}.300`,
    icon: `${colorBase}.500`,
    bg: `${colorBase}.50`,
    fg: `${colorBase}.800`
  };
};

const getIcon = (type: ToastType) => {
  if (type === 'info') return FaInfoCircle;
  if (type === 'success') return FaCheckCircle;
  if (type === 'error') return FaExclamationCircle;
  return FaInfoCircle;
};

export const StyledToast = ({ title, description, type, onClose }: ToastProps) => {
  const colors = getColors(type);
  return (
    <Box
      borderWidth="1px"
      borderRadius="xl"
      bg={colors.bg}
      color={colors.fg}
      borderColor={colors.border}
      minW="18rem"
      paddingY="2"
      paddingX="3"
      position="relative"
    >
      <HStack spacing={3}>
        <Icon as={getIcon(type)} color={colors.icon} boxSize="5" />
        <VStack spacing={0} align="flex-start" flex={1}>
          {title && (
            <Text as="b" align="left">
              {title}
            </Text>
          )}
          <Text align="left" fontSize="sm" textDecorationColor="inherit">
            {description}
          </Text>
        </VStack>
        <IconButton
          position="absolute"
          top="2"
          right="0"
          padding="0"
          h="16px"
          color="gray.500"
          _hover={{ backgroundColor: 'inherit' }}
          _active={{ backgroundColor: 'inherit' }}
          icon={<FiX size={12} />}
          variant="ghost"
          aria-label="close"
          title="Close"
          onClick={onClose}
        />
      </HStack>
    </Box>
  );
};
