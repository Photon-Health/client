import { customElement } from 'solid-element';
import { PatientMedHistory } from '@photonhealth/components';
import tailwind from '../tailwind.css?inline';

interface PatientMedProps {
  patientId: string;
}

const PatientMedHistoryWrapper = (props: PatientMedProps) => {
  return (
    <div>
      <style>{tailwind}</style>
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
