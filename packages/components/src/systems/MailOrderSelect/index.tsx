import { createMemo, createSignal, For, Show } from 'solid-js';
import { MailOrderCard } from './MailOrderCard';

interface MailOrderSelectProps {
  pharmacyIds: string[];
}

export function MailOrderSelect(props: MailOrderSelectProps) {
  const [selectedValue, setSelectedValue] = createSignal('');
  const hasIds = createMemo(() => props.pharmacyIds.length > 0);

  return (
    <div>
      <Show when={hasIds()} fallback={<div>No mail order pharmacies found.</div>}>
        <fieldset class="space-y-3">
          <legend class="sr-only">Mail Order Options</legend>
          <For each={props.pharmacyIds}>
            {(pharmacyId) => (
              <MailOrderCard pharmacyId={pharmacyId} selected={selectedValue() === pharmacyId}>
                <input
                  type="radio"
                  name="mail-order"
                  value={pharmacyId}
                  checked={selectedValue() === pharmacyId}
                  onChange={() => setSelectedValue(pharmacyId)}
                  class="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-600"
                />
              </MailOrderCard>
            )}
          </For>
        </fieldset>
      </Show>
    </div>
  );
}
