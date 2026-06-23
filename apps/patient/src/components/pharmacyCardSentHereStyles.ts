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
      bgColor: 'blue.50',
      borderWidth: '2px',
      borderColor: 'blue.500'
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
