import queryString from 'query-string';
import { DemoTokenPayload } from '../views/Main';

export function buildDemoQuery(
  demoToken: DemoTokenPayload | undefined,
  token: string | null,
  phone: string | null
) {
  return demoToken
    ? queryString.stringify({ token })
    : queryString.stringify({ demo: true, phone });
}
