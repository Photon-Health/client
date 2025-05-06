import { CoverageOption, PrescriptionFormData } from '../../PrescribeProvider';
import { For } from 'solid-js';
import { CoverageOptionSummary } from './CoverageOptionSummary';
import Button from '../../../particles/Button';
import Card from '../../../particles/Card';
import { format } from 'date-fns';

export type OtherCoverageOptionsListProps = {
  coverageOptions: CoverageOption[];
  handleSwapToOtherPrescription: (other: PrescriptionFormData) => void;
};

export function OtherCoverageOptionsList(props: OtherCoverageOptionsListProps) {
  return (
    <>
      <div>Other Options</div>
      <For each={props.coverageOptions}>
        {(coverageOption) => (
          <OtherCoverageOptionListItem
            coverageOption={coverageOption}
            handleSwapToOtherPrescription={props.handleSwapToOtherPrescription}
          />
        )}
      </For>
    </>
  );
}

export type OtherCoverageOptionListItemProps = {
  coverageOption: CoverageOption;
  handleSwapToOtherPrescription: (alternative: PrescriptionFormData) => void;
};

export function OtherCoverageOptionListItem(props: OtherCoverageOptionListItemProps) {
  const handleSelectOtherOptionClick = async () => {
    props.handleSwapToOtherPrescription(toFormData(props.coverageOption));
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
          <Button size="sm" variant="naked" on:click={handleSelectOtherOptionClick}>
            Select This Option
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
