import { useQuery } from '@apollo/client';
import { usePhoton } from '@photonhealth/react';
import { MutableRefObject, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { graphql } from 'apps/app/src/gql';
import { useProviderAnalytics } from '../../../hooks/useProviderAnalytics';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'photon-patient-dialog': unknown;
    }
  }
}

const orgSettingsQuery = graphql(/* GraphQL */ `
  query PatientFormOrgSettingsQuery {
    organization {
      settings {
        providerUx {
          optionalPatientAddress
        }
      }
    }
  }
`);

export const PatientForm = () => {
  const ref: MutableRefObject<any> = useRef(null);
  const navigate = useNavigate();
  const { track } = useProviderAnalytics();
  const { clinicalClient } = usePhoton();

  const { data } = useQuery(orgSettingsQuery, { client: clinicalClient });
  const optionalPatientAddress =
    data?.organization?.settings?.providerUx?.optionalPatientAddress ?? false;

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
      <photon-patient-dialog ref={ref} optional-patient-address={optionalPatientAddress} />
    </div>
  );
};
