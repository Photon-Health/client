import { splitProps } from 'solid-js';
import Input, { InputProps } from '../Input';
import { AddressSuggestionList } from './AddressSuggestionList';
import { ParsedAddress, useAddressAutocomplete } from './useAddressAutocomplete';

export type { ParsedAddress };

interface AddressAutocompleteInputProps extends InputProps {
  onAddressSelect: (address: ParsedAddress) => void;
}

export default function AddressAutocompleteInput(props: AddressAutocompleteInputProps) {
  const [local, handlers, inputProps] = splitProps(
    props,
    ['onAddressSelect'],
    ['onInput', 'onBlur']
  );

  const { suggestions, fetchSuggestions, selectSuggestion, closeSuggestions, openSuggestions } =
    useAddressAutocomplete({ onSelect: local.onAddressSelect });

  return (
    <div class="relative">
      <Input
        {...inputProps}
        data-1p-ignore
        onInput={(e) => {
          if (handlers.onInput) {
            // @ts-ignore
            handlers.onInput(e);
          }
          fetchSuggestions(e.currentTarget.value);
        }}
        onFocus={openSuggestions}
        onBlur={(e) => {
          if (handlers.onBlur) {
            // @ts-ignore
            handlers.onBlur(e);
          }
          setTimeout(closeSuggestions, 200);
        }}
      />
      <AddressSuggestionList suggestions={suggestions()} onSelect={selectSuggestion} />
    </div>
  );
}
