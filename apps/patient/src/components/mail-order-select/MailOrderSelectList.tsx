import { VStack } from '@chakra-ui/react';
import { MailOrderPharmacyOption, MailOrderSelectCard } from './MailOrderSelectCard';

export type MailOrderSelectListProps = {
  options: MailOrderPharmacyOption[];
  onSelect: (val: MailOrderPharmacyOption) => unknown;
  selectedId?: string;
};

export function MailOrderSelectList({ options, onSelect, selectedId }: MailOrderSelectListProps) {
  return (
    <VStack w="full">
      {options?.map((option) => (
        <MailOrderSelectCard
          {...option}
          key={option.id}
          selected={selectedId === option.id}
          onClick={onSelect}
        />
      ))}
    </VStack>
  );
}
