import { HStack, IconButton, Text, Tooltip, useClipboard } from '@chakra-ui/react';
import { FiCheck, FiCopy } from 'react-icons/fi';

const CopyText = ({ text, size = 'md' }: { text: string; size?: 'xs' | 'sm' | 'md' | 'lg' }) => {
  const { onCopy, hasCopied } = useClipboard(text);
  if (!text) return null;
  return (
    <HStack spacing={2}>
      <Text
        fontSize={size}
        whiteSpace={{ base: 'nowrap', sm: 'normal' }}
        overflow={{ base: 'hidden', sm: 'visible' }}
        textOverflow={{ base: 'ellipsis', sm: 'clip' }}
        fontWeight={size === 'lg' ? 'medium' : undefined}
      >
        {text}
      </Text>
      {hasCopied ? (
        <FiCheck color="green" />
      ) : (
        <Tooltip hasArrow label="Copy" bg="gray.200" placement="top" color="black">
          <IconButton
            variant="ghost"
            color="gray.500"
            aria-label="Copy external id"
            minW="fit-content"
            h="fit-content"
            py={0}
            my={0}
            size={size}
            _hover={{ backgroundColor: 'transparent' }}
            icon={<FiCopy size="1.3em" />}
            onClick={onCopy}
          />
        </Tooltip>
      )}
    </HStack>
  );
};

export default CopyText;
