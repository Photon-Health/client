import { Tag, TagLabel, TagLeftIcon } from '@chakra-ui/react';
import { FiStar } from 'react-icons/fi';
import { text as t } from '../utils/text';

export const PreferredTag = () => {
  return (
    <Tag size="sm" colorScheme="blue">
      <TagLeftIcon boxSize="12px" as={FiStar} />
      <TagLabel>{t.preferred}</TagLabel>
    </Tag>
  );
};
