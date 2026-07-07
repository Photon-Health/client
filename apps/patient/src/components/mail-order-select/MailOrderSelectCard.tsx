import { Box, Card, HStack, Image, Text } from '@chakra-ui/react';
import { FulfillmentType } from '../../__generated__/graphql';
import { PharmacyCardSentHereFrame } from '../pharmacy-card/sent-here/PharmacyCardSentHereFrame';
import { getPharmacyCardBorderStyle } from '../pharmacy-card/sent-here/pharmacyCardSentHereStyles';

export type MailOrderPharmacyOption = {
  id: string;
  name: string;
  logo?: string;
  fulfillmentTypes?: Array<FulfillmentType>;
};

export type MailOrderSelectCardProps = MailOrderPharmacyOption & {
  onClick: (val: MailOrderPharmacyOption) => unknown;
  selected?: boolean;
  isAutoroutedPharmacy?: boolean;
  isCurrentPharmacy?: boolean;
};

export function MailOrderSelectCard({
  onClick,
  selected = false,
  isAutoroutedPharmacy = false,
  isCurrentPharmacy = false,
  ...mailOrderPharmacyOption
}: MailOrderSelectCardProps) {
  const borderStyle = getPharmacyCardBorderStyle({
    isAutoroutedPharmacy,
    isPharmacyFulfillingCurrentOrder: isCurrentPharmacy,
    selected
  });

  const card = (
    <Card
      w="full"
      shadow="none"
      borderRadius="lg"
      borderWidth={borderStyle.borderWidth}
      borderColor={borderStyle.borderColor}
      bgColor={borderStyle.bgColor}
      role="radio"
      aria-checked={selected}
      aria-label={mailOrderPharmacyOption.name}
      onClick={() => onClick(mailOrderPharmacyOption)}
    >
      <HStack p={4} spacing={4}>
        {mailOrderPharmacyOption.logo && (
          <Box minWidth="8" w="8" borderRadius="full" overflow="clip">
            <Image src={mailOrderPharmacyOption.logo} />
          </Box>
        )}
        <Text fontSize="md" fontWeight="medium">
          {mailOrderPharmacyOption.name}
        </Text>
      </HStack>
    </Card>
  );

  return isAutoroutedPharmacy ? (
    <PharmacyCardSentHereFrame selected={selected}>{card}</PharmacyCardSentHereFrame>
  ) : (
    card
  );
}
