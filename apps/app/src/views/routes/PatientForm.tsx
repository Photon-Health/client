import { useRef, MutableRefObject, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ulid } from 'ulid';

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

  useEffect(() => {
    if (ref.current) {
      ref.current.open = true;
      ref.current.addEventListener('photon-patient-created', (e: any) => {
        const id = e?.detail?.patientId;
        if (e?.detail?.createPrescription) {
          navigate(`/prescriptions/new?patientId=${id}`);
        } else {
          navigate(`/patients?reload=${id}-${ulid()}`);
        }
      });
      ref.current.addEventListener('photon-patient-closed', () => {
        navigate(`/patients`);
      });
    }
  }, [ref.current]);

  return (
    <div>
      <photon-patient-dialog ref={ref} />
    </div>
  );
};
