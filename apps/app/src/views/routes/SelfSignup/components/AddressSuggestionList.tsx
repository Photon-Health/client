import { List, ListItem } from '@chakra-ui/react';
import { AddressSuggestion } from './useAddressAutocomplete';

interface AddressSuggestionListProps {
  suggestions: AddressSuggestion[];
  onSelect: (suggestion: AddressSuggestion) => void;
}

export const AddressSuggestionList = ({ suggestions, onSelect }: AddressSuggestionListProps) => {
  if (suggestions.length === 0) return null;

  return (
    <List
      position="absolute"
      zIndex="dropdown"
      bg="white"
      width="100%"
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="md"
      boxShadow="lg"
      mt="1"
      py="1"
      maxH="260px"
      overflowY="auto"
    >
      {suggestions.map((suggestion) => (
        <ListItem
          key={suggestion.placeId}
          px="4"
          py="3"
          fontSize="sm"
          cursor="pointer"
          _hover={{ bg: 'gray.50' }}
          _active={{ bg: 'gray.100' }}
          onMouseDown={(e) => {
            // Prevent blur from firing before the click registers
            e.preventDefault();
            onSelect(suggestion);
          }}
        >
          {suggestion.description}
        </ListItem>
      ))}
    </List>
  );
};
