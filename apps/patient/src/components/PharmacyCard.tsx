import { memo, useEffect, useState } from 'react';
import { Button, Card, CardBody, CardFooter, Collapse, Divider } from '@chakra-ui/react';
import { FiStar } from 'react-icons/fi';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Pharmacy as EnrichedPharmacy } from '../utils/models';
import { text as t } from '../utils/text';
import { PharmacyInfo } from './PharmacyInfo';
import { useOrderContext } from '../views/Main';
import { usePatientAnalytics } from '../hooks/usePatientAnalytics';

dayjs.extend(customParseFormat);

// feature flagging preferred pharmacy skip for certain orgs
// should eventually be replaced with passing context in runtime properties when evaluating flag
const ignorePreferredPharmacyOrgs: Record<string, string> = {
  boson: 'org_4ukJmtK1kahiwSjh',
  neutron: 'org_tA6GiBBgGBZwnf4e',
  photon: 'org_vhFRkpsq7JXLxjXr'
};

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
  const { order } = useOrderContext();
  const patientAnalytics = usePatientAnalytics();

  const isSkipPreferredPharmacyOrg =
    order?.organization.id === ignorePreferredPharmacyOrgs[import.meta.env.VITE_ENV_NAME ?? ''];
  const [skipPreferredPharmacy, setSkipPreferredPharmacy] = useState(false);

  useEffect(() => {
    if (!isSkipPreferredPharmacyOrg) {
      setSkipPreferredPharmacy(false);
      return;
    }

    const fetchFlag = async () => {
      const { isActive } = await patientAnalytics.getFlagValue('skip_preferred_pharmacy');
      setSkipPreferredPharmacy(isActive);
    };
    fetchFlag();
  }, [isSkipPreferredPharmacyOrg, patientAnalytics]);

  if (!pharmacy) return null;

  return (
    <Card
      bgColor={isCurrentPharmacy ? 'gray.200' : 'white'}
      borderWidth={selected ? '2px' : '1px'}
      borderColor={selected && onSelect ? 'brand.500' : isCurrentPharmacy ? 'gray.300' : 'gray.200'}
      shadow={'none'}
      borderRadius="lg"
      onClick={() => onSelect && onSelect()}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onSelect) {
          e.preventDefault();
          onSelect();
        }
      }}
      mx={{ base: -2, md: undefined }}
      cursor={selectable ? 'pointer' : undefined}
      pointerEvents={isCurrentPharmacy ? 'none' : undefined}
      opacity={isCurrentPharmacy ? 0.7 : undefined}
      role="radio"
      aria-checked={selected}
      aria-label={pharmacy.name}
      aria-disabled={isCurrentPharmacy}
      tabIndex={isCurrentPharmacy ? -1 : 0}
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
            {onSetPreferred && !skipPreferredPharmacy ? (
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
