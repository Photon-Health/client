import { createRef, MutableRefObject, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ulid } from 'ulid';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'photon-update-patient-dialog': unknown;
    }
  }
}

export const UpdatePatientForm = () => {
  const ref: MutableRefObject<any> = createRef();
  const params = useParams();
  const navigate = useNavigate();
  const id = params.patientId;

  useEffect(() => {
    if (ref.current) {
      ref.current.patientId = id;
      ref.current.open = true;
      ref.current.addEventListener('photon-patient-updated', async () => {
        navigate(`/patients?reload=${id}-${ulid()}`);
      });
      ref.current.addEventListener('photon-patient-closed', async () => {
        navigate(`/patients`);
      });
    }
  }, [ref.current]);

  return (
    <div>
      <photon-update-patient-dialog ref={ref} patient />
    </div>
  );
};
