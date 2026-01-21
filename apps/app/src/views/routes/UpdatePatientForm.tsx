import { useQuery } from '@apollo/client';
import { usePhoton } from '@photonhealth/react';
import { createRef, MutableRefObject, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { graphql } from 'apps/app/src/gql';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'photon-patient-dialog': unknown;
    }
  }
}

const orgSettingsQuery = graphql(/* GraphQL */ `
  query UpdatePatientFormOrgSettingsQuery {
    organization {
      settings {
        providerUx {
          optionalPatientAddress
        }
      }
    }
  }
`);

export const UpdatePatientForm = () => {
  const ref: MutableRefObject<any> = createRef();
  const params = useParams();
  const navigate = useNavigate();
  const { clinicalClient } = usePhoton();
  const id = params.patientId;

  const { data } = useQuery(orgSettingsQuery, { client: clinicalClient });
  const optionalPatientAddress =
    data?.organization?.settings?.providerUx?.optionalPatientAddress ?? false;

  useEffect(() => {
    if (ref.current) {
      ref.current.patientId = id;
      ref.current.open = true;
      ref.current.addEventListener('photon-patient-updated', (e: any) => {
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
      <photon-patient-dialog
        ref={ref}
        patient-id={id}
        optional-patient-address={optionalPatientAddress}
      />
    </div>
  );
};
