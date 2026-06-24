type PharmacyCardBorderStyle = {
  bgColor: string;
  borderWidth: string;
  borderColor: string;
};

type PharmacyCardBorderStyleInput = {
  // sole auto route with no reroutes — shows "sent here" treatment
  isAutoroutedPharmacy: boolean;
  // order.pharmacy when not autorouted — grey card + "current pharmacy" tag
  isCurrentPharmacy: boolean;
  // patient clicked this card in the pharmacy list
  selected: boolean;
};

// border/background only — does not determine current vs autorouted; callers pass those flags in.
export const getPharmacyCardBorderStyle = ({
  isAutoroutedPharmacy,
  isCurrentPharmacy,
  selected
}: PharmacyCardBorderStyleInput): PharmacyCardBorderStyle => {
  if (selected) {
    return {
      bgColor: isCurrentPharmacy ? 'gray.200' : 'white',
      borderWidth: '2px',
      borderColor: 'brand.500'
    };
  }

  if (isAutoroutedPharmacy) {
    return {
      bgColor: 'blue.50',
      borderWidth: '2px',
      borderColor: 'blue.500'
    };
  }

  if (isCurrentPharmacy) {
    return {
      bgColor: 'gray.200',
      borderWidth: '1px',
      borderColor: 'gray.300'
    };
  }

  return {
    bgColor: 'white',
    borderWidth: '1px',
    borderColor: 'gray.200'
  };
};
