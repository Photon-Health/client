import { MutableRefObject, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProviderAnalytics } from '../../../hooks/useProviderAnalytics';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'photon-patient-dialog': unknown;
    }
  }
}

export const PatientForm = () => {
  const ref: MutableRefObject<any> = useRef(null);
  const navigate = useNavigate();
  const { track } = useProviderAnalytics();

  useEffect(() => {
    if (ref.current) {
      ref.current.open = true;
      track('patient_form_opened');

      ref.current.addEventListener('photon-patient-created', (e: any) => {
        const id = e?.detail?.patientId;
        track('patient_form_created', { patientId: id });

        if (e?.detail?.createPrescription) {
          navigate(`/prescriptions/new?patientId=${id}`);
        } else {
          navigate(`/patients`);
        }
      });
      ref.current.addEventListener('photon-patient-closed', () => {
        navigate(`/patients`);
      });
    }
  }, [navigate, track]);

  return (
    <div>
      <photon-patient-dialog ref={ref} />
    </div>
  );
};
