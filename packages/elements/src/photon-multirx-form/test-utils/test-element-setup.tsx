import {
  PhotonPrescribeWorkflowComponent,
  PrescribeWorkflowComponentProps
} from '../photon-prescribe-workflow-component';
import { createTestClient, createTestClientStore } from '../../test-utils/createTestClient';
import { render, screen } from '@solidjs/testing-library';
import { GoogleServiceProvider, PhotonContext, SDKProvider } from '@photonhealth/components';
import userEvent from '@testing-library/user-event/dist/cjs/index.js';
import { DISPENSE_UNIT, TREATMENT } from '@photonhealth/sdk/test-utils';

export function renderPrescribeWorkflow(props: Partial<PrescribeWorkflowComponentProps> = {}) {
  const client = createTestClient();
  const clientStore = createTestClientStore(client);
  const eventListenerHost = document.createElement('div');

  // Capture bubbled CustomEvents dispatched from inside the prescribe workflow.
  // Listeners must be attached BEFORE render so events fired during mount aren't missed.
  const analyticsEvents: CustomEvent[] = [];
  const attestationResolvedEvents: Event[] = [];
  const supervisorErrorEvents: CustomEvent[] = [];
  const diagnosisCodeErrorEvents: CustomEvent[] = [];

  eventListenerHost.addEventListener('photon-analytics-track-event', (event: Event) => {
    analyticsEvents.push(event as CustomEvent);
  });
  eventListenerHost.addEventListener('photon-signature-attestation-resolved', (event: Event) => {
    attestationResolvedEvents.push(event);
  });
  eventListenerHost.addEventListener('photon-supervisor-error', (event: Event) => {
    supervisorErrorEvents.push(event as CustomEvent);
  });
  eventListenerHost.addEventListener('photon-diagnosis-code-error', (event: Event) => {
    diagnosisCodeErrorEvents.push(event as CustomEvent);
  });

  document.body.append(eventListenerHost);

  const baseProps: PrescribeWorkflowComponentProps = {
    patientId: 'pat_123',
    hideSubmit: false,
    hideTemplates: false,
    hidePatientCard: false,
    enableOrder: false,
    enableMedHistory: false,
    enableMedHistoryLinks: false,
    enableMedHistoryRefillButton: false,
    enableCombineAndDuplicate: false,
    optionalPatientAddress: false,
    allowOffCatalogSearch: true,
    triggerSubmit: false,
    toastBuffer: 0,
    enableCoverageCheck: false,
    enableLocalPickup: false,
    enableSendToPatient: false,
    enableDeliveryPharmacies: false
  };

  const mergedProps = { ...baseProps, ...props };
  const user = userEvent.setup();

  const view = render(
    () => (
      <PhotonContext.Provider value={clientStore as never}>
        <SDKProvider client={client as never}>
          <GoogleServiceProvider>
            <PhotonPrescribeWorkflowComponent {...mergedProps} />
          </GoogleServiceProvider>
        </SDKProvider>
      </PhotonContext.Provider>
    ),
    { container: eventListenerHost }
  );

  async function waitForPrescribeForm() {
    await screen.findByRole('button', { name: /add prescription/i }, { timeout: 3000 });
  }

  async function waitForSignatureAttestationModal() {
    await screen.findByText('Prescriber Signature Attestation');
  }

  async function addDraftPrescription() {
    await user.selectOptions(screen.getByLabelText(/search for treatment/i), TREATMENT.id);
    await user.type(screen.getByLabelText(/quantity/i), '30');
    await user.selectOptions(screen.getByLabelText(/dispense unit/i), DISPENSE_UNIT.name);
    await user.type(screen.getByLabelText(/days supply/i), '10');
    await user.type(screen.getByLabelText(/^refills/i), '0');
    await user.type(
      screen.getByLabelText(/patient instructions/i),
      'Take one capsule by mouth daily'
    );
    await user.click(screen.getByRole('button', { name: /add prescription/i }));
  }

  async function waitForDraftPrescription() {
    await screen.findByText(TREATMENT.name, {}, { timeout: 3000 });
  }

  return {
    ...view,
    user,
    eventListenerHost,
    analyticsEvents,
    attestationResolvedEvents,
    supervisorErrorEvents,
    diagnosisCodeErrorEvents,
    waitForPrescribeForm,
    waitForSignatureAttestationModal,
    addDraftPrescription,
    waitForDraftPrescription
  };
}
