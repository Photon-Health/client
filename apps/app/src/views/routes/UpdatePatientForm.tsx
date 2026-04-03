import { useQuery } from '@apollo/client';
import { usePhoton } from '@photonhealth/react';
import { MutableRefObject, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { graphql } from 'apps/app/src/gql';
import type { PhotonEmbedAnalyticsEventInput } from '@photonhealth/sdk';
import { useProviderAnalytics } from '../../hooks/useProviderAnalytics';
import { trackAnalyticsEvent } from '../../instrumentation/analyticsTrackEventListenerUtils';

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
  const providerAnalytics = useProviderAnalytics();
  const { clinicalClient } = usePhoton();
  const id = params.patientId;

  const { data } = useQuery(orgSettingsQuery, { client: clinicalClient });
  const optionalPatientAddress =
    data?.organization?.settings?.providerUx?.optionalPatientAddress ?? false;

  useEffect(() => {
    if (!ref.current) return;

    const abortController = new AbortController();
    const { signal: abortControllerSignal } = abortController;
    const listenerOptions = { signal: abortControllerSignal };

    ref.current.addEventListener(
      'photon-analytics-track-event',
      (e: CustomEvent<PhotonEmbedAnalyticsEventInput>) => {
        trackAnalyticsEvent(e.detail, providerAnalytics.track);
      },
      listenerOptions
    );

    // these ref.current setters must be after the photon-analytics-track-event so that the data is set properly when the
    // photon-analytics-track-event fires, due to how the solidjs code within the WebComponent executes
    // photon-analytics-track-event depends on the `ref.current.open` and `ref.current.patientId` values
    ref.current.patientId = id;
    ref.current.open = true;

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
  }, [navigate, providerAnalytics, id]);

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
