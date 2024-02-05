import { customElement } from 'solid-element';

const Component = (props: { patientId: string; open: boolean }) => {
  console.warn(
    'photon-update-patient-dialog will be deprecated soon. Please use photon-patient-dialog instead.'
  );
  return <photon-patient-dialog patient-id={props.patientId} open={props.open} />;
};
customElement(
  'photon-update-patient-dialog',
  {
    patientId: '',
    open: false
  },
  Component
);
