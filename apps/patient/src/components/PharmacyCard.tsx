import { memo } from 'react';
import { Button, Card, CardBody, CardFooter, Collapse, Divider } from '@chakra-ui/react';
import { FiStar } from 'react-icons/fi';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Pharmacy as EnrichedPharmacy } from '../utils/models';
import { text as t } from '../utils/text';
import { PharmacyInfo } from './PharmacyInfo';

dayjs.extend(customParseFormat);

interface PharmacyCardProps {
  pharmacy: EnrichedPharmacy;
  preferred?: boolean;
  savingPreferred?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  onSetPreferred?: () => void;
  selectable?: boolean;
  showDetails?: boolean;
  showPrice?: boolean;
  isCurrentPharmacy?: boolean;
}

export const PharmacyCard = memo(function PharmacyCard({
  pharmacy,
  preferred = false,
  savingPreferred = false,
  selected = false,
  onSelect,
  onSetPreferred,
  selectable = false,
  showDetails = true,
  showPrice = false,
  isCurrentPharmacy = false
}: PharmacyCardProps) {
  if (!pharmacy) return null;

  return (
    <Card
      bgColor={isCurrentPharmacy ? 'gray.200' : 'white'}
      borderWidth={selected ? '2px' : '1px'}
      borderColor={selected && onSelect ? 'brand.500' : isCurrentPharmacy ? 'gray.300' : 'gray.100'}
      shadow={isCurrentPharmacy ? 'none' : undefined}
      borderRadius="lg"
      onClick={() => onSelect && onSelect()}
      mx={{ base: -3, md: undefined }}
      cursor={selectable ? 'pointer' : undefined}
      pointerEvents={isCurrentPharmacy ? 'none' : undefined}
      opacity={isCurrentPharmacy ? 0.7 : undefined}
    >
      <CardBody p={3}>
        <PharmacyInfo
          pharmacy={pharmacy}
          preferred={preferred}
          showDetails={showDetails}
          showPrice={showPrice}
          boldPharmacyName={false}
          selected={selected}
          isCurrentPharmacy={isCurrentPharmacy}
        />
      </CardBody>
      {showDetails ? (
        <Collapse in={selected && !preferred} animateOpacity>
          <Divider />
          <CardFooter p={2}>
            {onSetPreferred ? (
              <Button
                mx="auto"
                size="sm"
                variant="ghost"
                color="link"
                onClick={onSetPreferred}
                isLoading={savingPreferred}
                leftIcon={<FiStar />}
              >
                {t.makePreferred}
              </Button>
            ) : null}
          </CardFooter>
        </Collapse>
      ) : null}
    </Card>
  );
});
