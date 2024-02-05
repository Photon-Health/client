import { customElement } from 'solid-element';
import { usePhotonWrapper } from '../store-context';
import tailwind from '../tailwind.css?inline';

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
  (props) => {
    const photon = usePhotonWrapper();

    if (!photon) {
      console.error(
        '[photon-auth-button] No valid PhotonClient instance was provided. Please ensure you are wrapping the element in a photon-client element'
      );
      return (
        <div>
          [photon-auth-button] No valid PhotonClient instance was provided. Please ensure you are
          wrapping the element in a photon-client element
        </div>
      );
    }

    return (
      <>
        <style>{tailwind}</style>
        {photon ? (
          <>
            <button
              disabled={photon().authentication.state.isLoading}
              onClick={async () => {
                const args: any = { appState: {} };
                if (props.redirectPath) {
                  args.appState.returnTo = props.redirectPath;
                }
                if (photon().authentication.state.isAuthenticated) {
                  await photon().authentication.logout();
                } else {
                  await photon().authentication.login(args);
                }
              }}
              class="w-full disabled:bg-gray-500 bg-photon-blue hover:bg-blue-700 text-white h-10 px-4 rounded-lg font-sans hover:bg-photon-blue-dark transition ease-in-out delay-50"
            >
              {photon().authentication.state.isAuthenticated ? 'Log out' : 'Log in'}
            </button>
          </>
        ) : null}
      </>
    );
  }
);
