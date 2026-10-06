import { VStack } from '@chakra-ui/react';
import { MailOrderPharmacyOption, MailOrderSelectCard } from './MailOrderSelectCard';

export type MailOrderSelectListProps = {
  options: MailOrderPharmacyOption[];
  onSelect: (val: MailOrderPharmacyOption) => unknown;
  selectedId?: string;
  autoroutedPharmacyId?: string;
};

export function MailOrderSelectList({
  options,
  onSelect,
  selectedId,
  autoroutedPharmacyId
}: MailOrderSelectListProps) {
  return (
    <VStack w="full" align="stretch">
      {options?.map((option) => (
        <MailOrderSelectCard
          key={option.id}
          {...option}
          selected={selectedId === option.id}
          isAutoroutedPharmacy={!!autoroutedPharmacyId && option.id === autoroutedPharmacyId}
          onClick={onSelect}
        />
      ))}
    </VStack>
  );
}
