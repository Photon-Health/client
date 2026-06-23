type PharmacyCardBorderStyle = {
  bgColor: string;
  borderWidth: string;
  borderColor: string;
};

export const getPharmacyCardBorderStyle = ({
  isAutoroutedPharmacy,
  isCurrentPharmacy,
  selected
}: {
  isAutoroutedPharmacy: boolean;
  isCurrentPharmacy: boolean;
  selected: boolean;
}): PharmacyCardBorderStyle => {
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
