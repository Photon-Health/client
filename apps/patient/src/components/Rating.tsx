import { HStack, Icon, Text } from '@chakra-ui/react';
import { FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';

const getStarIcon = (rating: number, pos: number) => {
  if (rating >= pos) return FaStar;
  if (pos > rating && pos - rating < 1) return FaStarHalfAlt;
  return FaRegStar;
};

export const Rating = ({ rating }: { rating: number }) => {
  if (!rating) return null;

  return (
    <HStack>
      <Text fontSize="sm" me={0} color="gray.500">
        {rating.toFixed(1)}
      </Text>
      <HStack spacing={1}>
        <Icon as={getStarIcon(rating, 1)} color="orange" w={4} h={4} />
        <Icon as={getStarIcon(rating, 2)} color="orange" w={4} h={4} />
        <Icon as={getStarIcon(rating, 3)} color="orange" w={4} h={4} />
        <Icon as={getStarIcon(rating, 4)} color="orange" w={4} h={4} />
        <Icon as={getStarIcon(rating, 5)} color="orange" w={4} h={4} />
      </HStack>
    </HStack>
  );
};
