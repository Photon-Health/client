import { HStack, IconButton, Text } from '@chakra-ui/react';
import { FiCopy } from 'react-icons/fi';

const CopyText = ({ text }: { text: string }) => {
  if (!text) return null;
  return (
    <HStack spacing={2}>
      <Text
        fontSize="md"
        whiteSpace={{ base: 'nowrap', sm: 'normal' }}
        overflow={{ base: 'hidden', sm: 'visible' }}
        textOverflow={{ base: 'ellipsis', sm: 'clip' }}
      >
        {text}
      </Text>
      <IconButton
        variant="ghost"
        color="gray.500"
        aria-label="Copy external id"
        minW="fit-content"
        h="fit-content"
        py={0}
        my={0}
        _hover={{ backgroundColor: 'transparent' }}
        icon={<FiCopy size="1.3em" />}
        onClick={() => navigator.clipboard.writeText(text || '')}
      />
    </HStack>
  );
};

export default CopyText;
