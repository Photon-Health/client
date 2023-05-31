import { HStack, Icon, Text } from '@chakra-ui/react';
import { FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';

const getStarIcon = (rating: number, pos: number) => {
  if (rating >= pos) return FaStar;
  if (pos > rating && pos - rating < 1) return FaStarHalfAlt;
  return FaRegStar;
};

export const Rating = ({ rating }: { rating: string }) => {
  if (!rating) return null;

  const ratingNum = parseFloat(rating);

  return (
    <HStack>
      <Text fontSize="sm" me={0} color="gray.500">
        {ratingNum.toFixed(1)}
      </Text>
      <HStack spacing={1}>
        <Icon as={getStarIcon(ratingNum, 1)} color="orange" w={4} h={4} />
        <Icon as={getStarIcon(ratingNum, 2)} color="orange" w={4} h={4} />
        <Icon as={getStarIcon(ratingNum, 3)} color="orange" w={4} h={4} />
        <Icon as={getStarIcon(ratingNum, 4)} color="orange" w={4} h={4} />
        <Icon as={getStarIcon(ratingNum, 5)} color="orange" w={4} h={4} />
      </HStack>
    </HStack>
  );
};
