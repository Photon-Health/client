import { usePhoton } from 'packages/react/src/provider';
import { clinicalApiUrl, Env } from 'packages/sdk/src/utils';
import { useMemo } from 'react';

class ClinicalRestApi {
  private apiUrl: string;
  private getToken: () => Promise<string>;
  private token?: string;

  constructor({ env, getToken }: { env: Env; getToken: () => Promise<string> }) {
    this.apiUrl = clinicalApiUrl[env];
    this.getToken = getToken;
  }

  async request<Data = unknown, Body = Partial<Data>>({
    method,
    path,
    body,
    query
  }: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    body?: Body;
    query?: URLSearchParams;
  }) {
    if (!this.token) {
      this.token = await this.getToken();
      if (!this.token) {
        throw new Error('No token found');
      }
    }

    const fullUrl = new URL(this.apiUrl);
    fullUrl.pathname = path;

    if (query) {
      fullUrl.search = query.toString();
    }

    const isMultiPart = body instanceof FormData;
    const _body = isMultiPart ? body : body ? JSON.stringify(body) : undefined;

    const response = await fetch(fullUrl.href, {
      method,
      body: _body,
      headers: {
        'x-photon-auth-token': this.token,
        'x-photon-auth-token-type': 'auth0',
        ...(isMultiPart ? {} : { 'Content-Type': 'application/json' })
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error);
    }

    return data as Data;
  }

  async get<Data = unknown>(path: string, query?: URLSearchParams) {
    return this.request<Data>({ method: 'GET', path, query });
  }

  async post<Data = unknown, Body = Partial<Data>>(path: string, body?: Body) {
    return this.request<Data, Body>({ method: 'POST', path, body });
  }

  async put<Data = unknown, Body = Partial<Data>>(path: string, body?: Body) {
    return this.request<Data, Body>({ method: 'PUT', path, body });
  }

  async delete<Data = unknown>(path: string, query?: URLSearchParams) {
    return this.request<Data>({ method: 'DELETE', path, query });
  }
}

export function useClinicalRest() {
  const { env, getToken } = usePhoton();

  const restApi = useMemo(() => new ClinicalRestApi({ env, getToken }), [env, getToken]);

  return restApi;
}
