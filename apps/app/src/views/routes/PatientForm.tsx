import { useRef, MutableRefObject, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'photon-patient-page': unknown;
    }
  }
}

export const PatientForm = () => {
  const ref: MutableRefObject<any> = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (ref.current) {
      ref.current.open = true;
      ref.current.addEventListener('photon-patient-created', (e: any) => {
        const id = e?.detail?.patientId;
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
  }, [ref.current]);

  return (
    <div>
      <photon-patient-page ref={ref} />
    </div>
  );
};
