import { useQuery } from '@apollo/client';
import { usePhoton } from '@photonhealth/react';
import { MutableRefObject, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { graphql } from 'apps/app/src/gql';
import { useProviderAnalytics } from 'apps/app/src/hooks/useProviderAnalytics';

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
  const { clinicalClient } = usePhoton();
  const { track } = useProviderAnalytics();

  useEffect(() => {
    track('New Patient Page Viewed');
  }, []);

  const { data } = useQuery(orgSettingsQuery, { client: clinicalClient });
  const optionalPatientAddress =
    data?.organization?.settings?.providerUx?.optionalPatientAddress ?? false;

  useEffect(() => {
    if (!ref.current) return;

    const abortController = new AbortController();
    const { signal: abortControllerSignal } = abortController;
    const listenerOptions = { signal: abortControllerSignal };

    // this ref.current setter must be after the photon-analytics-track-event so that the data is set properly when the
    // photon-analytics-track-event fires, due to how the solidjs code within the WebComponent executes.
    // photon-analytics-track-event depends on the `ref.current.open` value
    ref.current.open = true;

    ref.current.addEventListener(
      'photon-patient-created',
      (e: any) => {
        const id = e?.detail?.patientId;
        if (e?.detail?.createPrescription) {
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
  }, [navigate]);

  return (
    <div>
      <photon-patient-dialog
        ref={ref}
        data-testid="patient-dialog"
        optional-patient-address={optionalPatientAddress}
        hide-header-on-ios-webview={true}
      />
    </div>
  );
};
