import { HStack, Text } from '@chakra-ui/react';
import { text as t } from '../../utils/text';

export type PharmacyTabKey = 'pickup' | 'delivery';

function PharmacyTypeTab({
  label,
  selected,
  onClick
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <Text
      as="span"
      display="inline-block"
      fontWeight="semibold"
      fontSize="md"
      color="gray.900"
      pb={3}
      borderBottom="2px solid"
      borderColor={selected ? 'blue.500' : 'transparent'}
      role="tab"
      tabIndex={0}
      aria-selected={selected}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {label}
    </Text>
  );
}

export function PharmacyTypeTabBar({
  activeTab,
  onTabChange
}: {
  activeTab: PharmacyTabKey;
  onTabChange: (tab: PharmacyTabKey) => void;
}) {
  return (
    <HStack spacing={6} align="stretch" role="tablist">
      <PharmacyTypeTab
        label={t.pickUp}
        selected={activeTab === 'pickup'}
        onClick={() => onTabChange('pickup')}
      />
      <PharmacyTypeTab
        label={t.delivery}
        selected={activeTab === 'delivery'}
        onClick={() => onTabChange('delivery')}
      />
    </HStack>
  );
}
