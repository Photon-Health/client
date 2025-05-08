import { CoverageOption } from '../../PrescribeProvider';
import { For } from 'solid-js';
import { CoverageOptionSummary } from './CoverageOptionSummary';
import Button from '../../../particles/Button';
import Card from '../../../particles/Card';

export type OtherCoverageOptionsListProps = {
  coverageOptions: CoverageOption[];
  handleSwapToOtherPrescription: (coverageOption: CoverageOption) => void;
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
  handleSwapToOtherPrescription: (coverageOption: CoverageOption) => void;
};

export function OtherCoverageOptionListItem(props: OtherCoverageOptionListItemProps) {
  const handleSelectOtherOptionClick = async () => {
    props.handleSwapToOtherPrescription(props.coverageOption);
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
