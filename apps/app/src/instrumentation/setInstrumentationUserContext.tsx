import { datadogRum } from '@datadog/browser-rum';

const SELF_SIGNUP_STORAGE_KEY = 'dd_rum_is_self_signup';

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

  // Restore isSelfSignup flag that was persisted before the Auth0 redirect
  if (sessionStorage.getItem(SELF_SIGNUP_STORAGE_KEY)) {
    datadogRum.setGlobalContextProperty('session', {
      isSelfSignup: true
    });
  }
}

export function setInstrumentationSelfSignupUserContext(user: { email: string; name: string }) {
  // Persist flag so it survives the full-page, post-signup submission redirect through Auth0
  sessionStorage.setItem(SELF_SIGNUP_STORAGE_KEY, 'true');

  datadogRum.setGlobalContextProperty('session', {
    isSelfSignup: true
  });
  datadogRum.setUser({
    email: user.email,
    name: user.name
  });
}
