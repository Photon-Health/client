import { createMemo, For, Show } from 'solid-js';
import { MailOrderCard } from './MailOrderCard';

interface MailOrderSelectProps {
  pharmacyIds: string[];
}

export function MailOrderSelect(props: MailOrderSelectProps) {
  const hasIds = createMemo(() => props.pharmacyIds.length > 0);

  return (
    <div>
      <Show when={hasIds()} fallback={<div>No mail order pharmacies found.</div>}>
        <div class="space-y-3">
          <For each={props.pharmacyIds}>
            {(pharmacyId) => <MailOrderCard pharmacyId={pharmacyId} />}
          </For>
        </div>
      </Show>
    </div>
  );
}
