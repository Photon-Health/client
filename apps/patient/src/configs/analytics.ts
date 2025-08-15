import { ApiObject, IdentifyTraits, RudderAnalytics } from '@rudderstack/analytics-js';
import { Order } from '../utils/models';

const RUDDERSTACK_WRITE_KEY = process.env.REACT_APP_RUDDERSTACK_WRITE_KEY;
const RUDDERSTACK_DATA_PLANE_URL = process.env.REACT_APP_RUDDERSTACK_DATA_PLANE_URL;
const ENVIRONMENT = process.env.REACT_APP_ENV_NAME || 'development';

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
  const medications: ContextDataMedication[] = order.fills.map((fill) => ({
    id: fill.treatment.id,
    name: fill.treatment.name,
    strength:
      'strength' in fill.treatment && fill.treatment.strength ? fill.treatment.strength : '',
    quantity: fill.prescription?.dispenseQuantity || 0,
    unit: fill.prescription?.dispenseUnit || ''
  }));

  const orderMetadata: ContextDataOrderMetadata = {
    type: order.metadata?.type || '',
    marketIsRequired: order.metadata?.marketIsRequired || false,
    fulfillmentMethod: order.metadata?.fulfillmentMethod || '',
    transmissionType: order.metadata?.transmissionType || '',
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

  return {
    order: contextDataOrder,
    patient: contextDataPatient,
    organization: contextDataOrganization,
    pharmacy: contextDataPharmacy,
    fulfillments: contextDataFulfillments,
    medications
  };
}

export class PatientAnalytics {
  private rudderanalytics?: RudderAnalytics;
  private environment = 'development';

  constructor() {
    if (!RUDDERSTACK_WRITE_KEY || !RUDDERSTACK_DATA_PLANE_URL) {
      console.error('RudderStack write key and data plane URL are required');
      return;
    }

    this.rudderanalytics = new RudderAnalytics();
    this.rudderanalytics.load(RUDDERSTACK_WRITE_KEY || '', RUDDERSTACK_DATA_PLANE_URL || '');
    this.environment = ENVIRONMENT;
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

    this.rudderanalytics.track(eventName, trackProperties);
  }

  identify({
    userId,
    address,
    orgId,
    orgName
  }: {
    userId: string;
    address: IdentifyTraits['address'];
    orgId: string;
    orgName: string;
  }) {
    if (!this.rudderanalytics) {
      return;
    }

    this.rudderanalytics.identify(userId, { address });
    this.rudderanalytics.group(orgId, { name: orgName });
  }
}

export const patientAnalytics = new PatientAnalytics();
