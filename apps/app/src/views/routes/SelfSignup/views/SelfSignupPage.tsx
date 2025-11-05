import { auth0Config } from '../../../../configs/auth';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'photon-self-signup-workflow': unknown;
    }
  }
}

export const SelfSignupPage = () => {
  return <photon-self-signup-workflow auth-domain={auth0Config.domain} />;
};
