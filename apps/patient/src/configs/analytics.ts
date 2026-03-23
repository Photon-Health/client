import { ApiObject, IdentifyTraits, RudderAnalytics } from '@rudderstack/analytics-js';
import { Order } from '../utils/models';
import mixpanel from 'mixpanel-browser';

const RUDDERSTACK_WRITE_KEY = import.meta.env.VITE_RUDDERSTACK_WRITE_KEY;
const RUDDERSTACK_DATA_PLANE_URL = import.meta.env.VITE_RUDDERSTACK_DATA_PLANE_URL;
const ENVIRONMENT = import.meta.env.VITE_ENV_NAME || 'development';
const MIXPANEL_TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN;

interface ContextDataAddress {
  city: string;
  state: string;
  country: string;
  postalCode: string;
  [key: string]: any;
}

interface ContextDataPatient {
  id: string;
  dateOfBirth: string;
  gender: string;
  sex: string;
  address: ContextDataAddress;
  [key: string]: any;
}

interface ContextDataOrderMetadata {
  type: string;
  marketIsRequired: boolean;
  fulfillmentMethod: string;
  transmissionType: string;
  routingHistory: ContextDataRoutingHistory[];
  [key: string]: any;
}

interface ContextDataRoutingHistory {
  selector: string;
  createdAt: string;
  [key: string]: any;
}

interface ContextDataOrder {
  id: string;
  metadata: ContextDataOrderMetadata;
  [key: string]: any;
}

interface ContextDataOrganization {
  id: string;
  name: string;
  address: ContextDataAddress;
  [key: string]: any;
}

interface ContextDataPharmacy {
  id: string;
  name: string;
  address: ContextDataAddress;
  [key: string]: any;
}

interface ContextDataFulfillmentException {
  exceptionType: string;
  message: string;
  resolvedAt: string;
  [key: string]: any;
}

interface ContextDataFulfillment {
  id: string;
  state: string;
  exceptions: ContextDataFulfillmentException[];
  [key: string]: any;
}

interface ContextDataMedication {
  id: string;
  name: string;
  [key: string]: any;
}

interface ContextData {
  order: ContextDataOrder;
  patient: ContextDataPatient;
  organization: ContextDataOrganization;
  pharmacy: ContextDataPharmacy;
  fulfillments: ContextDataFulfillment[];
  medications: ContextDataMedication[];
  [key: string]: any;
}

function mapOrderToContextData(order: Order): ContextData {
  const medications: ContextDataMedication[] = order.fills.map((fill) => {
    const names =
      'names' in fill.treatment && Array.isArray(fill.treatment.names)
        ? fill.treatment.names
        : undefined;
    const therapeuticClassifications =
      'therapeuticClassifications' in fill.treatment &&
      Array.isArray(fill.treatment.therapeuticClassifications)
        ? fill.treatment.therapeuticClassifications
        : undefined;

    return {
      id: fill.treatment.id,
      name: fill.treatment.name,
      strength:
        'strength' in fill.treatment && fill.treatment.strength ? fill.treatment.strength : '',
      quantity: fill.prescription?.dispenseQuantity || 0,
      unit: fill.prescription?.dispenseUnit || '',
      names,
      therapeuticClassifications
    };
  });

  const orderMetadata: ContextDataOrderMetadata = {
    type: order.metadata?.type || '',
    marketIsRequired: order.metadata?.marketIsRequired || false,
    fulfillmentMethod: order.metadata?.fulfillmentMethod || '',
    transmissionType: order.metadata?.transmissionType || '',
    group: order.group || {},
    routingHistory: (order.metadata?.routingHistory || [])
      .filter((history): history is NonNullable<typeof history> =>
        Boolean(history?.selector && history?.createdAt)
      )
      .map(
        (history): ContextDataRoutingHistory => ({
          selector: history.selector || '',
          createdAt: history.createdAt || ''
        })
      )
  };

  const contextDataOrder: ContextDataOrder = {
    id: order.id,
    metadata: orderMetadata
  };

  // Map patient
  const contextDataPatient: ContextDataPatient = {
    id: order.patient?.id || '',
    dateOfBirth: order.patient?.dateOfBirth || '',
    gender: order.patient?.gender || '',
    sex: order.patient?.sex || '',
    address: {
      city: order.address?.city || '',
      state: order.address?.state || '',
      country: order.address?.country || '',
      postalCode: order.address?.postalCode || ''
    }
  };

  const contextDataOrganization: ContextDataOrganization = {
    id: order.organization?.id || '',
    name: order.organization?.name || '',
    automatedOps: order.organization?.settings?.patientUx?.enableAutomatedOps,
    address: {
      city: order.address?.city || '',
      state: order.address?.state || '',
      country: order.address?.country || '',
      postalCode: order.address?.postalCode || ''
    }
  };

  const contextDataPharmacy: ContextDataPharmacy = {
    id: order.pharmacy?.id || '',
    name: order.pharmacy?.name || '',
    address: {
      city: order.pharmacy?.address?.city || '',
      state: order.pharmacy?.address?.state || '',
      country: order.pharmacy?.address?.country || '',
      postalCode: order.pharmacy?.address?.postalCode || ''
    }
  };

  const contextDataFulfillments: ContextDataFulfillment[] = order.fulfillments.map(
    (fulfillment) => ({
      id: fulfillment.id,
      state: fulfillment.state,
      exceptions: fulfillment.exceptions.map((exception) => ({
        exceptionType: exception.exceptionType,
        message: exception.message || '',
        resolvedAt: exception.resolvedAt || ''
      }))
    })
  );

  const contextDataDiscountCards = order.discountCards.map((discountCard) => ({
    id: discountCard.id,
    externalUrl: discountCard.externalUrl,
    price: discountCard.price,
    retailPrice: discountCard.retailPrice,
    source: discountCard.source,
    memberId: discountCard.memberId,
    bin: discountCard.bin,
    pcn: discountCard.pcn
  }));

  const contextDataProvider = order.fills.map((fill) => ({
    id: fill.prescription?.provider?.id || '',
    name: fill.prescription?.provider?.name?.full || ''
  }))[0];

  return {
    order: contextDataOrder,
    patient: contextDataPatient,
    organization: contextDataOrganization,
    pharmacy: contextDataPharmacy,
    fulfillments: contextDataFulfillments,
    discountCards: contextDataDiscountCards,
    provider: contextDataProvider,
    medications
  };
}

class PatientAnalytics {
  private rudderanalytics?: RudderAnalytics;
  private environment = 'development';
  private mixpanelEnabled: boolean = false;

  constructor() {
    this.environment = ENVIRONMENT;

    if (RUDDERSTACK_WRITE_KEY && RUDDERSTACK_DATA_PLANE_URL) {
      this.rudderanalytics = new RudderAnalytics();
      this.rudderanalytics.load(RUDDERSTACK_WRITE_KEY || '', RUDDERSTACK_DATA_PLANE_URL || '');
    } else {
      console.error('RudderStack write key and data plane URL are required');
      return;
    }

    if (MIXPANEL_TOKEN) {
      mixpanel.init(MIXPANEL_TOKEN, {
        debug: false,
        track_pageview: true,
        persistence: 'localStorage',
        record_sessions_percent: 100, // session replay
        record_heatmap_data: true,
        flags: true
      });
      this.mixpanelEnabled = true;
    }
  }

  page(category: string, name?: string, properties: ApiObject = {}) {
    if (!this.rudderanalytics) {
      return;
    }

    const pageProperties = {
      environment: this.environment,
      ...properties
    };

    if (name) {
      this.rudderanalytics.page(category, name, pageProperties);
    } else {
      this.rudderanalytics.page(category, pageProperties);
    }
  }

  track(eventName: string, order: Order, properties: ApiObject = {}) {
    if (!this.rudderanalytics) {
      return;
    }

    const trackProperties = {
      environment: this.environment,
      ...mapOrderToContextData(order),
      ...properties
    };

    const isNonProductionEnvironment =
      this.environment === 'boson' ||
      this.environment === 'neutron' ||
      this.environment === 'tau' ||
      this.environment === 'local' ||
      this.environment === 'development';

    if (isNonProductionEnvironment) {
      console.log(`📊 [Analytics] ${eventName}`, trackProperties);
    }

    this.rudderanalytics.track(eventName, trackProperties);
  }

  identify({
    userId,
    address,
    orgId,
    orgName
  }: {
    userId?: string;
    address?: IdentifyTraits['address'];
    orgId?: string;
    orgName?: string;
  }) {
    if (this.rudderanalytics && userId && address && orgId && orgName) {
      this.rudderanalytics.identify(userId, { address });
      this.rudderanalytics.group(orgId, { name: orgName });
    }

    if (this.mixpanelEnabled && userId) {
      mixpanel.identify(userId);
    }
  }
}

export const patientAnalytics = new PatientAnalytics();
