import { CoverageOption, PrescriptionFormData } from '../../PrescribeProvider';
import { For } from 'solid-js';
import { CoverageOptionSummary } from './CoverageOptionSummary';
import Button from '../../../particles/Button';
import Card from '../../../particles/Card';
import { format } from 'date-fns';

export type AlternativeCoverageOptionListProps = {
  coverageOptions: CoverageOption[];
  handleSwapToAlternative: (alternative: PrescriptionFormData) => void;
};

export function AlternativeCoverageOptionList(props: AlternativeCoverageOptionListProps) {
  return (
    <>
      <div>Alternatives</div>
      <For each={props.coverageOptions}>
        {(coverageOption) => (
          <AlternativeCoverageOptionListItem
            coverageOption={coverageOption}
            handleSwapToAlternative={props.handleSwapToAlternative}
          />
        )}
      </For>
    </>
  );
}

export type AlternativeCoverageOptionListItemProps = {
  coverageOption: CoverageOption;
  handleSwapToAlternative: (alternative: PrescriptionFormData) => void;
};

export function AlternativeCoverageOptionListItem(props: AlternativeCoverageOptionListItemProps) {
  const handleSelectAlternativeClick = async () => {
    props.handleSwapToAlternative(toFormData(props.coverageOption));
  };

  return (
    <Card class="mb-1">
      <div class="flex flex-col gap-2">
        <div class="flex flex-col gap-2">
          <div class="flex flex-col gap-2">
            <div class="text-sm">{props.coverageOption.treatment.name}</div>
            <CoverageOptionSummary coverageOption={props.coverageOption} />
          </div>
        </div>
        <div class="flex justify-end mt-2">
          <Button size="sm" variant="naked" on:click={handleSelectAlternativeClick}>
            Select Alternative
          </Button>
        </div>
      </div>
    </Card>
  );
}

function toFormData(coverageOption: CoverageOption): PrescriptionFormData {
  return {
    // re-using the prescriptionId (via coverageOption.prescriptionId) of the original Prescription
    // so that the edit flow will remove it from the list of prescriptions
    id: coverageOption.prescriptionId,

    effectiveDate: format(new Date(), 'yyyy-MM-dd').toString(),
    dispenseAsWritten: false,
    dispenseQuantity: coverageOption.dispenseQuantity,
    dispenseUnit: coverageOption.dispenseUnit,
    daysSupply: coverageOption.daysSupply,
    instructions: '',
    notes: '',
    fillsAllowed: undefined,
    diagnoseCodes: [],
    externalId: undefined,
    catalogId: undefined,
    treatment: {
      id: coverageOption.treatment.id,
      name: coverageOption.treatment.name
    }
  };
}
