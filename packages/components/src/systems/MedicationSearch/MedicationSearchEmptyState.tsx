import { Show } from 'solid-js';

interface MedicationSearchEmptyStateProps {
  isLoading: boolean;
  isSearching?: boolean;
}

export default function MedicationSearchEmptyState(props: MedicationSearchEmptyStateProps) {
  return (
    <div class="px-3 py-4 text-center text-sm text-gray-500">
      <Show when={!props.isLoading && !props.isSearching} fallback="Searching...">
        No treatments found
      </Show>
    </div>
  );
}