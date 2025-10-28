import { Card, HStack, Box, Image, Text } from '@chakra-ui/react';
import { FulfillmentType } from '../../__generated__/graphql';

export type MailOrderPharmacyOption = {
  id: string;
  name: string;
  logo?: string;
  fulfillmentTypes?: Array<FulfillmentType>;
};

export type MailOrderSelectCardProps = MailOrderPharmacyOption & {
  onClick: (val: MailOrderPharmacyOption) => unknown;
  selected?: boolean;
};

export function MailOrderSelectCard({
  onClick,
  selected = false,
  ...mailOrderPharmacyOption
}: MailOrderSelectCardProps) {
  return (
    <Card
      w="full"
      padding="4"
      borderRadius="xl"
      shadow="none"
      dropShadow="none"
      cursor="pointer"
      border="solid"
      borderWidth="2px"
      borderColor={selected ? 'brand' : 'transparent'}
      transition="border-color 0.15s ease-out"
      onClick={() => onClick(mailOrderPharmacyOption)}
    >
      <HStack>
        {mailOrderPharmacyOption.logo && (
          <Box minWidth="8" w="8" borderRadius="full" overflow="clip">
            <Image src={mailOrderPharmacyOption.logo} />
          </Box>
        )}
        <Text
          as="span"
          fontSize="md"
          fontWeight="medium"
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="ellipsis"
          display="inline-block"
          title={mailOrderPharmacyOption.name}
        >
          {mailOrderPharmacyOption.name}
        </Text>
      </HStack>
    </Card>
  );
}
