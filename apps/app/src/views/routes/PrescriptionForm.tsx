import { datadogRum } from '@datadog/browser-rum';
import { usePhoton } from '@photonhealth/react';
import { useQuery } from '@apollo/client';
import { MutableRefObject, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { graphql } from 'apps/app/src/gql';
import { getOrgMailOrderPharms } from '@client/settings';
import { useProviderAnalytics } from '../../hooks/useProviderAnalytics';
import {
  buildPrescriptionFormInteractionPayload,
  buildSignatureAttestationFormInteractionPayload
} from '../../instrumentation/analyticsTrackEventListenerUtils';
import {
  type PhotonEmbedAnalyticsEventInput,
  type PrescriptionFormAnalyticsEvent,
  type PrescriptionFormTrackEventType
} from '@photonhealth/sdk';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'photon-multirx-form-wrapper': unknown;
    }
  }
}

const orgSettingsQuery = graphql(/* GraphQL */ `
  query PrescriptionFormOrgSettingsQuery {
    organization {
      settings {
        providerUx {
          enablePrescribeToOrder
          enableRxTemplates
          enableDuplicateRxWarnings
          enableTreatmentHistory
          enablePatientRouting
          enablePickupPharmacies
          enableDeliveryPharmacies
          optionalPatientAddress
        }
      }
    }
  }
`);

export const PrescriptionForm = () => {
  const ref: MutableRefObject<any> = useRef();
  const { user, clinicalClient } = usePhoton();
  const providerAnalytics = useProviderAnalytics();
  const [params] = useSearchParams();
  const patientId = params.get('patientId') || '';
  const pharmacyId = params.get('pharmacyId') || '';
  const templateIds = params.get('templateIds') || '';
  const prescriptionIds = params.get('prescriptionIds') || '';
  const weight = params.get('weight') || '';
  const weightUnit = params.get('weightUnit') || 'lbs';
  const externalId = params.get('externalId') || '';

  const { data } = useQuery(orgSettingsQuery, { client: clinicalClient });
  const orgSettings = data?.organization?.settings;
  const enablePrescribeToOrder = orgSettings?.providerUx?.enablePrescribeToOrder ?? true;
  const enableTreatmentHistory = orgSettings?.providerUx?.enableTreatmentHistory ?? false;
  const enablePickupPharmacies = orgSettings?.providerUx?.enablePickupPharmacies ?? true;
  const optionalPatientAddress = orgSettings?.providerUx?.optionalPatientAddress ?? false;
  const enableDeliveryPharmacies = orgSettings?.providerUx?.enableDeliveryPharmacies ?? false;
  const enablePatientRouting = orgSettings?.providerUx?.enablePatientRouting ?? true;
  const enableDuplicateRxWarnings = orgSettings?.providerUx?.enableDuplicateRxWarnings ?? true;
  const enableRxTemplates = orgSettings?.providerUx?.enableRxTemplates ?? true;
  const mailOrderProviders = getOrgMailOrderPharms(user?.org_id)?.provider;

  const navigate = useNavigate();
  const onClose = () => {
    navigate('/prescriptions');
  };

  // Stable ref so the analytics listener callback always reads the latest providerAnalytics
  // without being in the useEffect dependency array (which would tear down and re-register
  // all listeners on every auth/org state change, causing prefill events to be lost).
  const providerAnalyticsRef = useRef(providerAnalytics);
  providerAnalyticsRef.current = providerAnalytics;

  const prescriptionFormOpenWasTracked = useRef(false);
  useEffect(() => {
    if (providerAnalytics.isReady && !prescriptionFormOpenWasTracked.current) {
      prescriptionFormOpenWasTracked.current = true;
      providerAnalytics.track(
        'test_clinicalapp_prescription_form_track_events',
        buildPrescriptionFormInteractionPayload({
          trackEventType: 'prescription_form_opened',
          properties: {
            prefillPatientId: patientId || '',
            prefillPharmacyId: pharmacyId || '',
            hasPrefillPatientExternalId: !!externalId?.trim(),
            hasPrefillPrescriptionIds: !!prescriptionIds?.trim(),
            hasPrefillTemplateIds: !!templateIds?.trim(),
            hasPrefillWeight: !!weight?.trim(),
            weightUnit: weightUnit
          }
        })
      );
    }
  }, [
    providerAnalytics,
    patientId,
    pharmacyId,
    externalId,
    prescriptionIds,
    templateIds,
    weight,
    weightUnit
  ]);

  useEffect(() => {
    if (!ref.current) return;
    const abortController = new AbortController();
    const { signal: abortControllerSignal } = abortController;
    const listenerOptions = { signal: abortControllerSignal };

    const prescriptionFormEventTypes: Set<string> = new Set<PrescriptionFormTrackEventType>([
      'prescription_form_opened',
      'draft_prescription_added',
      'draft_prescription_deleted',
      'draft_prescription_edited',
      'order_created',
      'draft_prescriptions_activated',
      'screening_alert_acknowledged',
      'screening_alert_canceled',
      'prescription_form_closed',
      'prescription_field_interaction',
      'pharmacy_interaction'
    ]);

    ref.current.addEventListener(
      'photon-analytics-track-event',
      (e: { detail: PhotonEmbedAnalyticsEventInput }) => {
        const { trackEventType } = e.detail;
        if (
          trackEventType === 'signature_attestation_shown' ||
          trackEventType === 'signature_attestation_agreed' ||
          trackEventType === 'signature_attestation_canceled'
        ) {
          providerAnalyticsRef.current.track(
            'clinicalapp_signature_attestation_form_track_events',
            buildSignatureAttestationFormInteractionPayload(e.detail)
          );
        } else if (prescriptionFormEventTypes.has(trackEventType)) {
          providerAnalyticsRef.current.track(
            'test_clinicalapp_prescription_form_track_events',
            buildPrescriptionFormInteractionPayload(e.detail as PrescriptionFormAnalyticsEvent)
          );
        }
      },
      listenerOptions
    );

    if (patientId && ref.current) {
      // this ref.current setter must be after the photon-analytics-track-event so that the data is set properly when the
      // photon-analytics-track-event fires, due to how the solidjs code within the WebComponent executes.
      // the ref.current data is utilized by photon-analytics-track-event
      ref.current.patientId = patientId;
    }

    ref.current.addEventListener(
      'photon-prescriptions-created',
      (e: any) => {
        if (!e.detail.createOrder) {
          onClose();
        }
        if (e.detail.createOrder) {
          const searchParams = new URLSearchParams();
          searchParams.append('patientId', e.detail.patientId);
          searchParams.append('prescriptionIds', e.detail.prescriptionIds.join(','));
          navigate({
            pathname: '/orders/new',
            search: searchParams.toString()
          });
        }
      },
      listenerOptions
    );
    ref.current.addEventListener(
      'photon-order-created',
      (e: { detail: { order: { id: string } } }) => {
        const searchParams = new URLSearchParams();
        if (!e?.detail?.order) {
          return onClose();
        }

        navigate({
          pathname: `/orders/${e.detail.order.id}`,
          search: searchParams.toString()
        });
      },
      listenerOptions
    );
    ref.current.addEventListener('photon-prescriptions-closed', () => onClose(), listenerOptions);
    ref.current.addEventListener(
      'photon-order-combined',
      (e: { detail: { order: { id: string } } }) => {
        navigate(`/orders/${e.detail.order.id}`);
      },
      listenerOptions
    );
    ref.current.addEventListener(
      'photon-datadog-action',
      (e: {
        detail: {
          action: string;
          data: {
            [key: string]: unknown;
          };
        };
      }) => {
        datadogRum.addAction(e.detail.action, e.detail.data);
      },
      listenerOptions
    );
    return () => abortController.abort();
  }, [navigate, patientId, onClose]);

  const enableCoverageCheck = useMemo(() => {
    if (user) {
      // For initial RTBC release, only enabling coverage check in Clinical App for Photon employees in these orgs
      // Our first customers will enable RTBC via their elements config
      const bosonPhotonOrg = 'org_KzSVZBQixLRkqj5d'; // Test Organization 11
      const neutronPhotonOrg = 'org_kVS7AP4iuItESdMA'; // Photon Test Org
      const neutronDemoOrg = 'org_TY5GFYPIRo3xQGYM'; // Demo Health
      return [bosonPhotonOrg, neutronPhotonOrg, neutronDemoOrg].includes(user.org_id);
    }

    return false;
  }, [user]);

  //  TODO: remove enable-new-medication-search after discovery
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: 'white',
        width: '100%'
      }}
    >
      {user?.org_id ? (
        <photon-multirx-form-wrapper
          ref={ref}
          template-ids={templateIds}
          patient-id={patientId}
          pharmacy-id={pharmacyId}
          prescription-ids={prescriptionIds}
          weight={weight}
          weight-unit={weightUnit}
          enable-order={enablePrescribeToOrder}
          enable-med-history={enableTreatmentHistory}
          enable-med-history-links={true}
          enable-med-history-refill-button={true}
          enable-local-pickup={enablePickupPharmacies}
          enable-delivery-pharmacies={enableDeliveryPharmacies}
          enable-send-to-patient={enablePatientRouting}
          enable-combine-and-duplicate={enableDuplicateRxWarnings}
          enable-coverage-check={enableCoverageCheck}
          enable-new-medication-search={true}
          optional-patient-address={optionalPatientAddress}
          mail-order-ids={mailOrderProviders?.join(',') ?? ''}
          toast-buffer={70}
          hide-templates={!enableRxTemplates}
          external-order-id={externalId}
        />
      ) : null}
    </div>
  );
};
