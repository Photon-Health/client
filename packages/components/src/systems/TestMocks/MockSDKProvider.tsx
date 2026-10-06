// src/test/mocks/photonSdkMock.ts
import { PhotonClient } from '@photonhealth/sdk';
import { createContext, JSXElement } from 'solid-js';
import { vi, type Mock } from 'vitest';

export class MockPhotonClient {
  apollo: { query: Mock; mutate: Mock } = {
    query: vi.fn().mockImplementation(() => Promise.resolve({ data: {} })),
    mutate: vi.fn().mockImplementation(() => Promise.resolve({ data: {} }))
  };

  apolloClinical: { query: Mock; mutate: Mock } = {
    query: vi.fn().mockImplementation(() => Promise.resolve({ data: {} })),
    mutate: vi.fn().mockImplementation(() => Promise.resolve({ data: {} }))
  };

  clinical: { pharmacy: { getPharmacy: Mock } } = {
    pharmacy: {
      getPharmacy: vi.fn().mockImplementation(() =>
        Promise.resolve({
          data: {
            pharmacy: { name: 'Test Pharmacy', address: { city: 'Test City', state: 'TS' } }
          }
        })
      )
    }
  };

  // Add any other methods used in your components
  authentication: { getAccessToken: Mock; state: object } = {
    getAccessToken: vi.fn().mockImplementation(() => Promise.resolve('mock-token')),
    state: {}
  };

  setOrganization: Mock = vi.fn().mockReturnThis();
  clearOrganization: Mock = vi.fn().mockReturnThis();
}

export const MockSDKContext = createContext<PhotonClient>();

interface MockSDKProviderProps {
  client?: PhotonClient;
  children: JSXElement;
}

export function MockSDKProvider(props: MockSDKProviderProps) {
  const mockClient = props.client || (new MockPhotonClient() as unknown as PhotonClient);
  return <MockSDKContext.Provider value={mockClient}>{props.children}</MockSDKContext.Provider>;
}
