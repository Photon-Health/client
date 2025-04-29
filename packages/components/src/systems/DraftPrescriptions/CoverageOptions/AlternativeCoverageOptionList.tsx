import { CoverageOption } from '../../PrescribeProvider';
import { For } from 'solid-js';
import { CoverageOptionSummary } from './CoverageOptionSummary';
import Button from '../../../particles/Button';
import Card from '../../../particles/Card';

export type AlternativeCoverageOptionListProps = {
  coverageOptions: CoverageOption[];
};

export function AlternativeCoverageOptionList(props: AlternativeCoverageOptionListProps) {
  return (
    <>
      <div>Alternatives</div>
      <For each={props.coverageOptions}>
        {(coverageOption) => <AlternativeCoverageOptionListItem coverageOption={coverageOption} />}
      </For>
    </>
  );
}

export type AlternativeCoverageOptionListItemProps = {
  coverageOption: CoverageOption;
};

export function AlternativeCoverageOptionListItem(props: AlternativeCoverageOptionListItemProps) {
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
          <Button size="sm" variant="naked">
            Select Alternative
          </Button>
        </div>
      </div>
    </Card>
  );
}
