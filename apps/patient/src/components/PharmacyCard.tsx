import { memo } from 'react';
import { Button, Card, CardBody, CardFooter, Collapse, Divider } from '@chakra-ui/react';
import { FiStar } from 'react-icons/fi';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Pharmacy as EnrichedPharmacy } from '../utils/models';
import { text as t } from '../utils/text';
import { PharmacyInfo } from './PharmacyInfo';
import { PharmacyCardSentHereFrame } from './PharmacyCardSentHereFrame';
import { getPharmacyCardBorderStyle, isPharmacyCardSelectable } from './pharmacyCardSentHereStyles';

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
  isAutoroutedPharmacy?: boolean;
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
  isAutoroutedPharmacy = false,
  isCurrentPharmacy = false
}: PharmacyCardProps) {
  if (!pharmacy) return null;

  const isSelected = selected && !!onSelect;
  const borderStyle = getPharmacyCardBorderStyle({
    isAutoroutedPharmacy,
    isPharmacyFulfillingCurrentOrder: isCurrentPharmacy,
    selected: isSelected
  });
  const isSelectable =
    selectable &&
    isPharmacyCardSelectable({
      isAutoroutedPharmacy,
      isPharmacyFulfillingCurrentOrder: isCurrentPharmacy
    });

  const card = (
    <Card
      {...borderStyle}
      shadow={'none'}
      borderRadius="lg"
      onClick={() => isSelectable && onSelect && onSelect()}
      onKeyDown={(e) => {
        if (isSelectable && (e.key === 'Enter' || e.key === ' ') && onSelect) {
          e.preventDefault();
          onSelect();
        }
      }}
      cursor={isSelectable ? 'pointer' : undefined}
      pointerEvents={isSelectable ? undefined : 'none'}
      opacity={isSelectable ? undefined : 0.7}
      role="radio"
      aria-checked={selected}
      aria-label={pharmacy.name}
      aria-disabled={selectable && !isSelectable ? true : undefined}
      tabIndex={isSelectable ? 0 : -1}
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
          isStatus={false}
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

  return isAutoroutedPharmacy ? (
    <PharmacyCardSentHereFrame>{card}</PharmacyCardSentHereFrame>
  ) : (
    card
  );
});
