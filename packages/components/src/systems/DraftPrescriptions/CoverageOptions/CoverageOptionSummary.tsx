import { Prescription } from '@photonhealth/sdk/dist/types';
import { CoverageOption } from '../../PrescribeProvider';

export type CoverageOptionSummaryProps = {
  prescription: Prescription;
  coverageOption: CoverageOption;
};

export function CoverageOptionSummary(props: CoverageOptionSummaryProps) {
  return <div>Est. Copay: ${props.coverageOption.price}</div>;
}
