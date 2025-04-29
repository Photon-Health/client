import { Prescription } from '@photonhealth/sdk/dist/types';
import { CoverageOption } from '../../PrescribeProvider';
import { createMemo, For } from 'solid-js';

export type AlternativeCoverageOptionListProps = {
  prescription: Prescription;
  coverageOptions: CoverageOption[];
};

export function AlternativeCoverageOptionList(props: AlternativeCoverageOptionListProps) {
  const alternatives = createMemo(() => {
    return props.coverageOptions.filter((c) => c.prescriptionId === props.prescription.id);
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
