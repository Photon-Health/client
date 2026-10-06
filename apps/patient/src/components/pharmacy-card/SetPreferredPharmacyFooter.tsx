import { Button, CardFooter, Collapse, Divider } from '@chakra-ui/react';
import { FiStar } from 'react-icons/fi';
import { text as t } from '../../utils/text';

interface SetPreferredPharmacyFooterProps {
  show: boolean;
  saving?: boolean;
  onSetPreferred?: () => void;
}

export const SetPreferredPharmacyFooter = ({
  show,
  saving = false,
  onSetPreferred
}: SetPreferredPharmacyFooterProps) => (
  <Collapse in={show} animateOpacity>
    <Divider />
    <CardFooter p={2}>
      {onSetPreferred ? (
        <Button
          mx="auto"
          size="sm"
          variant="ghost"
          color="link"
          // the card itself is clickable, so don't also fire select
          onClick={(e) => {
            e.stopPropagation();
            onSetPreferred();
          }}
          isLoading={saving}
          leftIcon={<FiStar />}
        >
          {t.makePreferred}
        </Button>
      ) : null}
    </CardFooter>
  </Collapse>
);
