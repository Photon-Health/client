import { cleanup, render, screen } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { GoogleServiceProvider, PhotonContext, SDKProvider } from '@photonhealth/components';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { PatientStore } from '../stores/patient';
import {
  PhotonPrescribeWorkflowComponent,
  type PrescribeWorkflowComponentProps
} from './photon-prescribe-workflow-component';

vi.mock('solid-element', () => ({
  customElement: vi.fn()
}));

type AnalyticsDetail = Record<string, unknown>;

class MockMedicationSearchElement extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === 'true') {
      return;
    }

    this.dataset.initialized = 'true';

    const label = this.getAttribute('label') || 'Search for Treatment';
    const wrapper = document.createElement('label');
    wrapper.textContent = label;

    const select = document.createElement('select');
    select.setAttribute('aria-label', label);

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Select treatment';
    select.append(placeholder);

    const treatmentOption = document.createElement('option');
    treatmentOption.value = TREATMENT.id;
    treatmentOption.textContent = TREATMENT.name;
    select.append(treatmentOption);

    select.addEventListener('change', () => {
      const selected = select.value;

      if (!selected) {
        this.dispatchEvent(
          new CustomEvent('photon-treatment-unselected', {
            bubbles: true,
            composed: true
          })
        );
        return;
      }

      this.dispatchEvent(
        new CustomEvent('photon-search-text-changed', {
          bubbles: true,
          composed: true,
          detail: { text: TREATMENT.name }
        })
      );

      this.dispatchEvent(
        new CustomEvent('photon-treatment-selected', {
          bubbles: true,
          composed: true,
          detail: {
            data: TREATMENT,
            catalogId: 'cat_123'
          }
        })
      );
    });

    wrapper.append(select);
    this.append(wrapper);
  }
}

beforeAll(() => {
  if (!customElements.get('photon-medication-search')) {
    customElements.define('photon-medication-search', MockMedicationSearchElement);
  }

  Object.defineProperty(window, 'google', {
    configurable: true,
    writable: true,
    value: {
      maps: {
        Geocoder: class Geocoder {},
        places: {
          AutocompleteService: class AutocompleteService {}
        }
      }
    }
  });
});

afterEach(async () => {
  cleanup();
  vi.clearAllMocks();
  await PatientStore.actions.reset();
});

describe('prescribe workflow analytics', () => {
  it('emits the workflow page-view event when signature attestation is required', async () => {
    const { analyticsEvents } = renderPrescribeWorkflow({}, { attestationStatus: 'NEEDS' });

    await waitForSignatureAttestationModal();

    expect(analyticsEvents[0].detail).toEqual(
      expect.objectContaining({
        category: 'pageViewed',
        name: 'Signature Attestation Viewed',
        attestationVersion: 'v1',
        timestamp: expect.any(String)
      })
    );
  });

  it('emits a field interaction event when quantity is blurred', async () => {
    const { analyticsEvents, user } = renderPrescribeWorkflow();

    await waitForPrescribeForm();
    const quantityInput = screen.getByLabelText(/quantity/i);
    await user.type(quantityInput, '30');
    await user.tab(); // blur

    expect(
      findAnalyticsEvent(
        analyticsEvents,
        (detail) =>
          detail.category === 'fieldInteraction' &&
          detail.name === 'Field Interaction' &&
          detail.fieldName === 'dispenseQuantity'
      )?.detail
    ).toEqual(
      expect.objectContaining({
        category: 'fieldInteraction',
        name: 'Field Interaction',
        formName: 'add_prescription_form',
        fieldName: 'dispenseQuantity',
        hasValue: true,
        isOptional: false,
        timestamp: expect.any(String)
      })
    );
  });

  it('emits a draft-prescription CTA event when a prescription is added to drafts', async () => {
    const { analyticsEvents, user } = renderPrescribeWorkflow();

    await waitForPrescribeForm();
    await addDraftPrescription(user);

    expect(
      findAnalyticsEvent(
        analyticsEvents,
        (detail) =>
          detail.category === 'ctaClicked' &&
          detail.name === 'Minor CTA Clicked' &&
          detail.ctaName === 'draft prescription added'
      )?.detail
    ).toEqual(
      expect.objectContaining({
        category: 'ctaClicked',
        name: 'Minor CTA Clicked',
        ctaName: 'draft prescription added',
        draftPrescriptionSource: 'form',
        fields: expect.objectContaining({
          treatment: { completed: true },
          dispenseQuantity: { completed: true },
          dispenseUnit: { completed: true },
          instructions: { completed: true }
        }),
        timestamp: expect.any(String)
      })
    );
  });

  it('emits an order-sent CTA event when send is clicked after drafting a prescription', async () => {
    const { analyticsEvents, user } = renderPrescribeWorkflow({
      enableOrder: true,
      enableSendToPatient: true,
      optionalPatientAddress: true
    });

    await waitForPrescribeForm();
    await addDraftPrescription(user);
    await user.click(screen.getByRole('button', { name: /^send$/i }));

    expect(
      findAnalyticsEvent(
        analyticsEvents,
        (detail) => detail.category === 'ctaClicked' && detail.name === 'Order Sent'
      )?.detail
    ).toEqual(
      expect.objectContaining({
        category: 'ctaClicked',
        name: 'Order Sent',
        buttonText: 'Send',
        orderId: 'ord_abc',
        prescriptionCount: 1,
        fulfillmentType: 'SEND_TO_PATIENT',
        hasPreferredPharmacy: false,
        setAsPreferred: false,
        pharmacyId: null,
        isCombinedOrder: false,
        timestamp: expect.any(String)
      })
    );
  });
});

function getOperationSource(documentNode: { loc?: { source?: { body?: string } } }) {
  return documentNode.loc?.source?.body || '';
}

function createMockSdkClient({ attestationStatus = 'COMPLETE' as 'COMPLETE' | 'NEEDS' } = {}) {
  const createPrescription = vi.fn(
    async ({ variables }: { variables: Record<string, unknown> }) => ({
      data: {
        createPrescription: {
          id: 'rx_123',
          treatment: TREATMENT,
          dispenseQuantity: variables.dispenseQuantity,
          dispenseUnit: variables.dispenseUnit,
          fillsAllowed: variables.fillsAllowed,
          instructions: variables.instructions,
          state: 'DRAFT'
        }
      }
    })
  );

  const createOrder = vi.fn(async () => ({
    data: {
      createOrder: {
        id: 'ord_abc'
      }
    },
    errors: undefined
  }));

  const apollo = {
    query: vi.fn(async ({ query }: { query: { loc?: { source?: { body?: string } } } }) => {
      const source = getOperationSource(query);

      if (source.includes('orders(first: 5)')) {
        return {
          data: {
            patient: {
              id: PATIENT.id,
              name: { full: PATIENT.name.full },
              orders: []
            }
          }
        };
      }

      if (source.includes('preferredPharmacies')) {
        return {
          data: {
            patient: {
              id: PATIENT.id,
              preferredPharmacies: [],
              address: PATIENT.address
            }
          }
        };
      }

      return {
        data: {
          patient: {
            ...PATIENT
          }
        }
      };
    }),
    mutate: vi.fn(
      async ({
        mutation,
        variables
      }: {
        mutation: { loc?: { source?: { body?: string } } };
        variables: Record<string, unknown>;
      }) => {
        const source = getOperationSource(mutation);

        if (source.includes('createPrescription(')) {
          return createPrescription({ variables });
        }

        return { data: {} };
      }
    ),
    watchQuery: vi.fn(({ query }: { query: { loc?: { source?: { body?: string } } } }) => {
      const source = getOperationSource(query);
      let data: Record<string, unknown>;

      if (source.includes('orders(first: 5)')) {
        data = {
          patient: {
            id: PATIENT.id,
            name: { full: PATIENT.name.full },
            orders: []
          }
        };
      } else if (source.includes('orders(patientId: $id')) {
        data = { orders: [] };
      } else if (source.includes('preferredPharmacies')) {
        data = {
          patient: {
            id: PATIENT.id,
            preferredPharmacies: [],
            address: PATIENT.address
          }
        };
      } else {
        data = {};
      }

      return {
        subscribe: ({ next }: { next: (value: { data: Record<string, unknown> }) => void }) => {
          queueMicrotask(() => next({ data }));
          return {
            unsubscribe: () => undefined
          };
        }
      };
    })
  };

  const apolloClinical = {
    query: vi.fn(async ({ query }: { query: { loc?: { source?: { body?: string } } } }) => {
      const source = getOperationSource(query);

      if (source.includes('signatureAttestationStatus')) {
        return {
          data: {
            me: {
              signatureAttestationStatus:
                attestationStatus === 'NEEDS'
                  ? {
                      __typename: 'NeedsSignatureAttestation',
                      version: 'v1',
                      content: 'Please attest'
                    }
                  : {
                      __typename: 'CompletedSignatureAttestation',
                      agreedAt: new Date(),
                      version: 'v1'
                    }
            }
          }
        };
      }

      if (source.includes('prescriptionScreen')) {
        return {
          data: {
            prescriptionScreen: {
              alerts: []
            }
          }
        };
      }

      return {
        data: {
          me: {
            name: {
              title: 'MD'
            },
            address: {
              state: 'NY'
            }
          }
        }
      };
    }),
    mutate: vi.fn(async () => ({
      data: {
        updatePrescriptionStates: true
      }
    }))
  };

  const sdkClient = {
    apollo,
    apolloClinical,
    authentication: {
      getAccessToken: vi.fn(async () => 'mock-token')
    },
    clinical: {
      order: {
        createOrder: vi.fn(() => createOrder)
      },
      patient: {
        getPatient: vi.fn(async () => ({
          data: {
            patient: PATIENT
          },
          errors: []
        })),
        updatePatient: vi.fn(() => vi.fn(async () => ({ data: {} }))),
        removePatientPreferredPharmacy: vi.fn(() => vi.fn(async () => ({ data: {} })))
      },
      pharmacy: {
        getPharmacy: vi.fn(async () => ({
          data: {
            pharmacy: {
              id: 'phr_123',
              name: 'Test Pharmacy',
              address: {
                street1: '1 Main St',
                city: 'Brooklyn',
                state: 'NY',
                postalCode: '11249',
                country: 'US'
              }
            }
          }
        }))
      }
    }
  };
  return {
    sdkClient,
    createPrescription,
    createOrder
  };
}

function createMockClientStore(sdkClient: ReturnType<typeof createMockSdkClient>['sdkClient']) {
  return {
    sdk: sdkClient,
    getSDK: () => sdkClient,
    autoLogin: false,
    authentication: {
      state: {
        isAuthenticated: true,
        isLoading: false,
        isInOrg: true,
        permissions: ['read:patient', 'write:prescription'],
        error: undefined
      },
      login: vi.fn(),
      logout: vi.fn(),
      handleRedirect: vi.fn(),
      checkSession: vi.fn()
    },
    clinical: {
      dispenseUnits: {
        state: {
          isLoading: false,
          dispenseUnits: [DISPENSE_UNIT]
        },
        getDispenseUnits: vi.fn()
      }
    }
  };
}

function renderPrescribeWorkflow(
  props: Partial<PrescribeWorkflowComponentProps> = {},
  options: { attestationStatus?: 'COMPLETE' | 'NEEDS' } = {}
) {
  const { sdkClient } = createMockSdkClient(options);
  const clientStore = createMockClientStore(sdkClient);
  const eventListenerHost = document.createElement('div');

  const analyticsEvents: CustomEvent[] = [];

  eventListenerHost.addEventListener('photon-analytics-track-event', (event: Event) => {
    analyticsEvents.push(event as CustomEvent);
  });

  document.body.append(eventListenerHost);

  const baseProps = {
    patientId: PATIENT.id,
    hideSubmit: false,
    hideTemplates: false,
    hidePatientCard: false,
    enableOrder: false,
    enableMedHistory: false,
    enableMedHistoryLinks: false,
    enableMedHistoryRefillButton: false,
    enableCombineAndDuplicate: false,
    optionalPatientAddress: false,
    triggerSubmit: false,
    toastBuffer: 0,
    enableCoverageCheck: false,
    enableLocalPickup: false,
    enableSendToPatient: false,
    enableDeliveryPharmacies: false
  };

  const mergedProps = { ...baseProps, ...props };

  const view = render(
    () => (
      <PhotonContext.Provider value={clientStore as never}>
        <SDKProvider client={sdkClient as never}>
          <GoogleServiceProvider>
            <PhotonPrescribeWorkflowComponent {...mergedProps} />
          </GoogleServiceProvider>
        </SDKProvider>
      </PhotonContext.Provider>
    ),
    { container: eventListenerHost }
  );

  return {
    ...view,
    analyticsEvents,
    user: userEvent.setup()
  };
}

function findAnalyticsEvent(
  analyticsEvents: CustomEvent[],
  matcher: (detail: AnalyticsDetail) => boolean
) {
  return analyticsEvents.find((event) => matcher(event.detail as AnalyticsDetail));
}

async function waitForSignatureAttestationModal() {
  await screen.findByText('Prescriber Signature Attestation');
}

async function waitForPrescribeForm() {
  await screen.findByText('Add Prescription');
  await screen.findByRole('button', { name: /add to drafts/i });
}

async function addDraftPrescription(user: ReturnType<typeof userEvent.setup>) {
  await user.selectOptions(screen.getByLabelText(/search for treatment/i), TREATMENT.id);
  await user.type(screen.getByLabelText(/quantity/i), '30');
  await user.selectOptions(screen.getByLabelText(/dispense unit/i), DISPENSE_UNIT.name);
  await user.type(screen.getByLabelText(/days supply/i), '10');
  await user.type(screen.getByLabelText(/^refills/i), '0');
  await user.type(
    screen.getByLabelText(/patient instructions/i),
    'Take one capsule by mouth daily'
  );
  await user.click(screen.getByRole('button', { name: /add to drafts/i }));
}

const PATIENT = {
  id: 'pat_123',
  externalId: 'ext_pat_123',
  name: {
    full: 'Sally Patient',
    first: 'Sally',
    last: 'Patient',
    title: 'MD'
  },
  dateOfBirth: '1990-01-01',
  sex: 'FEMALE',
  gender: 'female',
  email: 'sally@example.com',
  phone: '+17185551234',
  address: undefined,
  preferredPharmacies: []
};

const TREATMENT = {
  __typename: 'Treatment',
  id: 'trt_123',
  name: 'Amoxicillin 500mg capsule',
  codes: {}
};

const DISPENSE_UNIT = {
  id: 'du_123',
  name: 'Tablet'
};
