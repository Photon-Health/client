import { For, Show } from 'solid-js';
import { AddressSuggestion } from './useAddressAutocomplete';

interface AddressSuggestionListProps {
  suggestions: AddressSuggestion[];
  onSelect: (suggestion: AddressSuggestion) => void;
}

export function AddressSuggestionList(props: AddressSuggestionListProps) {
  return (
    <Show when={props.suggestions.length > 0}>
      <ul
        class="absolute z-10 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-sm ring-1 ring-black ring-opacity-5 overflow-auto mt-1"
        role="listbox"
      >
        <For each={props.suggestions}>
          {(suggestion) => (
            <li
              class="px-4 py-3 cursor-pointer text-gray-900 hover:bg-gray-50 active:bg-gray-100"
              role="option"
              onMouseDown={(e) => {
                // Prevent blur from firing before the click registers
                e.preventDefault();
                props.onSelect(suggestion);
              }}
            >
              {suggestion.description}
            </li>
          )}
        </For>
      </ul>
    </Show>
  );
}
