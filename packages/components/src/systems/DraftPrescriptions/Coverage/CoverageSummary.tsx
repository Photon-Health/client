import { Prescription } from '@photonhealth/sdk/dist/types';
import { Coverage } from '../../PrescribeProvider';

export type CoverageSummaryProps = {
  prescription: Prescription;
  coverage: Coverage;
};

export function CoverageSummary(props: CoverageSummaryProps) {
  return <div>Est. Copay: ${props.coverage.price}</div>;
}
