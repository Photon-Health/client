type PharmacyCardBorderStyle = {
  bgColor: string;
  borderWidth: string;
  borderColor: string;
};

export const getPharmacyCardBorderStyle = ({
  isSentHere,
  selected
}: {
  isSentHere: boolean;
  selected: boolean;
}): PharmacyCardBorderStyle => {
  if (isSentHere) {
    return {
      bgColor: 'green.50',
      borderWidth: '2px',
      borderColor: 'green.600'
    };
  }

  if (selected) {
    return {
      bgColor: 'white',
      borderWidth: '2px',
      borderColor: 'brand.500'
    };
  }

  return {
    bgColor: 'white',
    borderWidth: '1px',
    borderColor: 'gray.200'
  };
};
