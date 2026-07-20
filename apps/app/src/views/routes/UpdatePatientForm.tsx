import { useQuery } from '@apollo/client';
import { usePhoton } from '@photonhealth/react';
import { MutableRefObject, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { graphql } from 'apps/app/src/gql';
import { useProviderAnalytics } from '../../hooks/useProviderAnalytics';

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
  const ref: MutableRefObject<any> = useRef(null);
  const params = useParams();
  const navigate = useNavigate();
  const { clinicalClient } = usePhoton();
  const id = params.patientId;
  const { track } = useProviderAnalytics();

  const { data } = useQuery(orgSettingsQuery, { client: clinicalClient });
  const optionalPatientAddress =
    data?.organization?.settings?.providerUx?.optionalPatientAddress ?? false;

  useEffect(() => {
    track('Update Patient Page Viewed');
  }, []);

  useEffect(() => {
    if (!ref.current) return;

    const abortController = new AbortController();
    const { signal: abortControllerSignal } = abortController;
    const listenerOptions = { signal: abortControllerSignal };

    ref.current.addEventListener(
      'photon-patient-updated',
      (e: any) => {
        if (e?.detail?.didClickCreatePatientAndPrescription) {
          navigate(`/prescriptions/new?patientId=${id}`);
        } else {
          navigate(`/patients`);
        }
      },
      listenerOptions
    );
    ref.current.addEventListener(
      'photon-patient-closed',
      () => navigate(`/patients`),
      listenerOptions
    );

    return () => abortController.abort();
  }, [navigate, id]);

  return (
    <div>
      <photon-patient-dialog
        ref={ref}
        patient-id={id}
        optional-patient-address={optionalPatientAddress}
        hide-header-on-ios-webview={true}
      />
    </div>
  );
};
