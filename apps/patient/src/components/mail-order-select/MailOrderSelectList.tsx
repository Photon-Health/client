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
          {...option}
          key={option.id}
          selected={selectedId === option.id}
          isAutoroutedPharmacy={!!autoroutedPharmacyId && option.id === autoroutedPharmacyId} // show special styling and "Sent here"
          onClick={onSelect}
        />
      ))}
    </VStack>
  );
}
