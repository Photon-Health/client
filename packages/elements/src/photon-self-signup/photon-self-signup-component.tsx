import { customElement } from 'solid-element';
import { createSignal, onMount } from 'solid-js';
import { Button } from '@photonhealth/components';
import tailwind from '../tailwind.css?inline';
import photonStyles from '@photonhealth/components/dist/style.css?inline';
import '@shoelace-style/shoelace/dist/components/alert/alert';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button';
import '@shoelace-style/shoelace/dist/components/icon/icon';
import '@shoelace-style/shoelace/dist/components/switch/switch';
import shoelaceDarkStyles from '@shoelace-style/shoelace/dist/themes/dark.css?inline';
import shoelaceLightStyles from '@shoelace-style/shoelace/dist/themes/light.css?inline';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.4.0/dist/');

interface SelfSignupProps {
  authDomain?: string;
}

const Component = (props: SelfSignupProps) => {
  const [npiInput, setNpiInput] = createSignal('');
  const [firstName, setFirstName] = createSignal('');
  const [lastName, setLastName] = createSignal('');
  const [email, setEmail] = createSignal('');
  const [state, setState] = createSignal<string | undefined>();
  const [error, setError] = createSignal<string | undefined>();

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const stateParam = urlParams.get('state');
    const sessionToken = urlParams.get('session_token');

    console.log({ elementDomain: props.authDomain });

    if (!stateParam) {
      setError('Error: no state');
      return;
    }

    setState(stateParam);

    if (sessionToken) {
      const tokenData = extractTokenData(sessionToken);
      setFirstName(tokenData.firstName || '');
      setLastName(tokenData.lastName || '');
      setEmail(tokenData.email || '');
    }
  });

  const onAcceptClick = () => {
    const authDomain = props.authDomain || window.location.hostname;
    window.location.href = `https://${authDomain}/continue?state=${state()}&did_accept_tos=true&npi=${encodeURIComponent(
      npiInput()
    )}`;
  };

  return (
    <>
      <style>{tailwind}</style>
      <style>{shoelaceDarkStyles}</style>
      <style>{shoelaceLightStyles}</style>
      <style>{photonStyles}</style>

      <div class="max-w-md mx-auto py-12">
        {error() ? (
          <div>{error()}</div>
        ) : (
          <div class="flex flex-col gap-8 text-center">
            <h1>Terms of Service</h1>
            <p>
              {firstName()} {lastName()}
            </p>
            <p>{email()}</p>
            <div class="flex flex-col gap-2 items-center">
              <label for="npi-input">NPI</label>
              <input
                id="npi-input"
                placeholder="1234567890"
                aria-label="NPI"
                value={npiInput()}
                onInput={(e) => setNpiInput(e.currentTarget.value)}
                class="p-2 w-48 text-sm border border-gray-300 rounded"
                maxLength={10}
                minLength={10}
              />
            </div>
            <Button onClick={onAcceptClick} variant="primary" size="md">
              Accept
            </Button>
          </div>
        )}
      </div>
    </>
  );
};
const extractTokenData = (tosSessionToken: string) => {
  try {
    const [, payload] = tosSessionToken.split('.');
    const decodedPayload = JSON.parse(atob(payload));
    return {
      firstName: decodedPayload.first_name || '',
      lastName: decodedPayload.last_name || '',
      email: decodedPayload.email || ''
    };
  } catch {
    return { firstName: '', lastName: '', email: '' };
  }
};

customElement('photon-self-signup-workflow', { authDomain: undefined }, Component);
