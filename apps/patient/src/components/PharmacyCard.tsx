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
  price?: number | null;
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
  price = null
}: PharmacyCardProps) {
  if (!pharmacy) return null;

  return (
    <Card
      bgColor="white"
      border="2px solid"
      borderColor={selected && onSelect ? 'brand.500' : 'white'}
      borderRadius="lg"
      onClick={() => onSelect && onSelect()}
      mx={{ base: -3, md: undefined }}
      cursor={selectable ? 'pointer' : undefined}
      data-dd-action-name={price ? 'selected_walmart_pilot' : undefined}
    >
      <CardBody p={3}>
        <PharmacyInfo
          pharmacy={pharmacy}
          preferred={preferred}
          showDetails={showDetails}
          boldPharmacyName={false}
          price={price}
          selected={selected}
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
