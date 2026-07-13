import { FulfillmentType } from 'packages/sdk/src/types';
import { generateOrder, generatePatient, generatePharmacy } from '../test-utils/generators';
import {
  getOrderFetchRedirectPath,
  hasSingleAutoRouteWithNoReroutes,
  hasSingleProviderRouteWithNoReroutes
} from './getOrderFetchRedirectPath';
import { Fill } from './models';

describe('When the order routing history has multiple entries', () => {
  const order = generateOrder({
    metadata: {
      routingHistory: [{ selector: 'AUTO' }, { selector: 'PATIENT' }]
    }
  });
  test('hasSingleAutoRouteWithNoReroutes is false', () => {
    expect(hasSingleAutoRouteWithNoReroutes(order)).toBe(false);
  });

  test('hasSingleProviderRouteWithNoReroutes is false', () => {
    expect(hasSingleProviderRouteWithNoReroutes(order)).toBe(false);
  });
});

test('hasSingleAutoRouteWithNoReroutes is true for sole AUTO routing history entry', () => {
  const order = generateOrder({
    metadata: {
      routingHistory: [{ selector: 'AUTO' }]
    }
  });

  expect(hasSingleAutoRouteWithNoReroutes(order)).toBe(true);
});

test('hasSingleProviderRouteWithNoReroutes is true for sole PROVIDER routing history entry', () => {
  const order = generateOrder({
    metadata: {
      routingHistory: [{ selector: 'PROVIDER' }]
    }
  });

  expect(hasSingleProviderRouteWithNoReroutes(order)).toBe(true);
});

test('getOrderFetchRedirectPath returns /canceled when order state is CANCELED', () => {
  expect(getOrderFetchRedirectPath(generateOrder({ state: 'CANCELED' }))).toBe('/canceled');
});

test('getOrderFetchRedirectPath returns /pharmacy when pharmacy was auto-routed and reroutable', () => {
  const order = generateOrder({
    state: 'ROUTING',
    isReroutable: true,
    pharmacy: generatePharmacy({ id: 'phr_auto' }),
    metadata: {
      routingHistory: [{ selector: 'AUTO' }]
    }
  });

  expect(getOrderFetchRedirectPath(order)).toBe('/pharmacy');
});

test('getOrderFetchRedirectPath returns /pharmacy when pharmacy was provider-routed and reroutable', () => {
  const order = generateOrder({
    state: 'ROUTING',
    isReroutable: true,
    pharmacy: generatePharmacy({ id: 'phr_auto' }),
    metadata: {
      routingHistory: [{ selector: 'PROVIDER' }]
    }
  });

  expect(getOrderFetchRedirectPath(order)).toBe('/pharmacy');
});

test('getOrderFetchRedirectPath returns /pharmacy when pharmacy was provider-routed to a Mail-In pharmacy and reroutable', () => {
  const order = generateOrder({
    state: 'ROUTING',
    isReroutable: true,
    pharmacy: generatePharmacy({ id: 'phr_auto', fulfillmentTypes: [FulfillmentType.MailOrder] }),
    metadata: {
      routingHistory: [{ selector: 'PROVIDER' }]
    }
  });

  expect(getOrderFetchRedirectPath(order)).toBe('/pharmacy');
});

test('getOrderFetchRedirectPath returns /status when auto-routed pharmacy was confirmed locally', () => {
  const order = generateOrder({
    state: 'ROUTING',
    isReroutable: true,
    pharmacy: generatePharmacy({ id: 'phr_auto' }),
    metadata: {
      routingHistory: [{ selector: 'AUTO' }]
    }
  });

  expect(getOrderFetchRedirectPath(order, { hasConfirmedAutoroutedPharmacy: true })).toBe(
    '/status'
  );
});

test('getOrderFetchRedirectPath returns /status when pharmacy was provider-routed and reroutable, but has a Compound Treatment', () => {
  const order = generateOrder({
    state: 'ROUTING',
    isReroutable: true,
    pharmacy: generatePharmacy({ id: 'phr_auto' }),
    fills: [
      {
        treatment: {
          __typename: 'Compound',
          name: 'Compound Treatment',
          id: 'cmd_1234'
        }
      } as Fill
    ],
    metadata: {
      routingHistory: [{ selector: 'PROVIDER' }]
    }
  });

  expect(getOrderFetchRedirectPath(order)).toBe('/status');
});

test('getOrderFetchRedirectPath returns /status when pharmacy was auto-routed but not reroutable', () => {
  const order = generateOrder({
    state: 'ROUTING',
    isReroutable: false,
    pharmacy: generatePharmacy({ id: 'phr_auto' }),
    metadata: {
      routingHistory: [{ selector: 'AUTO' }]
    }
  });

  expect(getOrderFetchRedirectPath(order)).toBe('/status');
});

test('getOrderFetchRedirectPath returns /status when pharmacy was patient-selected', () => {
  const order = generateOrder({
    state: 'ROUTING',
    pharmacy: generatePharmacy({ id: 'phr_selected' }),
    metadata: {
      routingHistory: [{ selector: 'PATIENT' }]
    }
  });

  expect(getOrderFetchRedirectPath(order)).toBe('/status');
});

test('getOrderFetchRedirectPath returns /status when pharmacy has multiple routing history entries', () => {
  const order = generateOrder({
    state: 'ROUTING',
    pharmacy: generatePharmacy({ id: 'phr_rerouted' }),
    metadata: {
      routingHistory: [{ selector: 'AUTO' }, { selector: 'PATIENT' }]
    }
  });

  expect(getOrderFetchRedirectPath(order)).toBe('/status');
});

test('getOrderFetchRedirectPath returns /status when pharmacy has no routing history metadata', () => {
  const order = generateOrder({
    state: 'ROUTING',
    isReroutable: true,
    pharmacy: generatePharmacy({ id: 'phr_no_metadata' }),
    metadata: undefined
  });

  expect(getOrderFetchRedirectPath(order)).toBe('/status');
});

test('getOrderFetchRedirectPath returns /status when pharmacy has empty routing history', () => {
  const order = generateOrder({
    state: 'ROUTING',
    isReroutable: true,
    pharmacy: generatePharmacy({ id: 'phr_empty_history' }),
    metadata: {
      routingHistory: []
    }
  });

  expect(getOrderFetchRedirectPath(order)).toBe('/status');
});

test('getOrderFetchRedirectPath returns /pharmacy when patient has address but no pharmacy', () => {
  const order = generateOrder({
    state: 'ROUTING',
    pharmacy: undefined,
    patient: generatePatient()
  });

  expect(getOrderFetchRedirectPath(order)).toBe('/pharmacy');
});

test('getOrderFetchRedirectPath returns /review when patient has no address and no pharmacy', () => {
  const order = generateOrder({
    state: 'ROUTING',
    pharmacy: undefined,
    patient: generatePatient({ address: undefined })
  });

  expect(getOrderFetchRedirectPath(order)).toBe('/review');
});
