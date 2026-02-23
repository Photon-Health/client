import { useQuery } from '@apollo/client';
import { usePhoton } from '@photonhealth/react';
import { createRef, MutableRefObject, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { graphql } from 'apps/app/src/gql';
import { type FormAnalyticsEventDetail } from '@photonhealth/components';
import { useProviderAnalytics } from '../../hooks/useProviderAnalytics';
import { buildFormInteractionPayload } from './analyticsListener';

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
  const { track } = useProviderAnalytics();
  const { clinicalClient } = usePhoton();
  const id = params.patientId;

  const { data } = useQuery(orgSettingsQuery, { client: clinicalClient });
  const optionalPatientAddress =
    data?.organization?.settings?.providerUx?.optionalPatientAddress ?? false;

  useEffect(() => {
    if (!ref.current) return;

    const abortController = new AbortController();
    const { signal } = abortController;

    ref.current.patientId = id;
    ref.current.open = true;

    ref.current.addEventListener(
      'photon-patient-updated',
      (e: any) => {
        if (e?.detail?.createPrescription) {
          navigate(`/prescriptions/new?patientId=${id}`);
        } else {
          navigate(`/patients`);
        }
      },
      { signal }
    );
    ref.current.addEventListener('photon-patient-closed', () => navigate(`/patients`), { signal });
    ref.current.addEventListener(
      'photon-analytics-event',
      (e: CustomEvent<FormAnalyticsEventDetail>) => {
        track('test_form_interaction', buildFormInteractionPayload(e.detail));
      },
      { signal }
    );

    return () => abortController.abort();
  }, [navigate, track]);

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
