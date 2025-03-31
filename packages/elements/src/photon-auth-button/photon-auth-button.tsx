import { customElement } from 'solid-element';
import { createEffect } from 'solid-js';
import { usePhoton } from '@photonhealth/components';
import tailwind from '../tailwind.css?inline';

const Component = (props: { redirectPath: string | undefined }) => {
  const client = usePhoton();

  createEffect(() => {
    if (!client) {
      console.error(
        '[photon-auth-button] No valid PhotonClient instance was provided. Please ensure you are wrapping the element in a photon-client element'
      );
    }
  });

  return (
    <>
      <style>{tailwind}</style>
      {client ? (
        <>
          <button
            disabled={client.authentication.state.isLoading}
            onClick={async () => {
              const args: any = { appState: {} };
              if (props.redirectPath) {
                args.appState.returnTo = props.redirectPath;
              }
              if (client.authentication.state.isAuthenticated) {
                await client.authentication.logout();
              } else {
                await client.authentication.login(args);
              }
            }}
            class="w-full disabled:bg-gray-500 bg-photon-blue hover:bg-blue-700 text-white h-10 px-4 rounded-lg font-sans hover:bg-photon-blue-dark transition ease-in-out delay-50"
          >
            {client.authentication.state.isAuthenticated ? 'Log out' : 'Log in'}
          </button>
        </>
      ) : null}
    </>
  );
};
customElement(
  'photon-auth-button',
  {
    redirectPath: {
      attribute: 'redirect-path',
      value: undefined,
      reflect: false,
      notify: false,
      parse: false
    }
  },
  Component
);
