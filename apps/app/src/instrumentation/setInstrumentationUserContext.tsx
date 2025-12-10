import { datadogRum } from '@datadog/browser-rum';

export function setInstrumentationUserContext(user: {
  org_id: string;
  email: string;
  name: string;
  customer_id?: string;
}) {
  datadogRum.setGlobalContextProperty('org', {
    orgId: user.org_id,
    customerId: user.customer_id
  });
  datadogRum.setUser({
    email: user.email,
    name: user.name
  });
}
