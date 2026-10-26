import { Tag, TagLabel, TagLeftIcon } from '@chakra-ui/react';
import { FiStar } from 'react-icons/fi';
import { BEST_IN_LEXINGTON_TAG_KIND } from '../../utils/offers';
import { OfferAttributeTag } from '../../utils/models';

const BestInLexingtonTag = ({ label }: { label: string }) => {
  return (
    <Tag size="sm" bgColor="green.100" color="green.600">
      <TagLeftIcon as={FiStar} fill="currentColor" data-testid="best-in-lexington-star" />
      <TagLabel fontWeight="bold">{label}</TagLabel>
    </Tag>
  );
};

export const AttributeTag = ({ kind, label }: OfferAttributeTag) => {
  if (kind === BEST_IN_LEXINGTON_TAG_KIND) {
    return <BestInLexingtonTag label={label} />;
  }

  return (
    <Tag size="sm" colorScheme="blue">
      <TagLabel>{label}</TagLabel>
    </Tag>
  );
};
