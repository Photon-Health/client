import { Prescription } from '@photonhealth/sdk/dist/types';
import { Coverage } from '../../PrescribeProvider';
import { createMemo, For } from 'solid-js';

export type CoverageSummaryProps = {
  prescription: Prescription;
  coverages: Coverage[];
};

export function CoverageOptionsAlternatives(props: CoverageSummaryProps) {
  const alternatives = createMemo(() => {
    return props.coverages.filter((c) => c.prescriptionId === props.prescription.id);
  });

  return (
    <div>
      <h3>Alternatives</h3>
      <For each={alternatives()}>
        {(coverage) => (
          <p>
            {coverage.treatment.name} - ${coverage.price}
          </p>
        )}
      </For>
    </div>
  );
}
