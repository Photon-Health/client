import { customElement } from 'solid-element';
import { PatientMedHistory } from '@photonhealth/components';
import photonStyles from '@photonhealth/components/dist/style.css?inline';

interface PatientMedProps {
  patientId: string;
}

const PatientMedHistoryWrapper = (props: PatientMedProps) => {
  return (
    <div>
      <style>{photonStyles}</style>
      <PatientMedHistory
        patientId={props.patientId}
        enableLinks={false}
        enableRefillButton={false}
      />
    </div>
  );
};

customElement(
  'photon-med-history',
  {
    patientId: ''
  },
  PatientMedHistoryWrapper
);
