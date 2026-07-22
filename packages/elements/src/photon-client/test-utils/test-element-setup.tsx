import { PhotonClientComponent, PhotonClientProps } from '../photon-client-component';
import { render } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event/dist/cjs/index.js';

export function renderPhotonClient(props: Partial<PhotonClientProps> = {}) {
  const baseProps: PhotonClientProps = {
    autoLogin: true,
    env: 'tau'
  };

  const mergedProps = { ...baseProps, ...props };
  const user = userEvent.setup();

  const view = render(() => <PhotonClientComponent {...mergedProps} />);
  const rootElement = view.container.firstElementChild as HTMLElement;

  return {
    ...view,
    user,
    rootElement
  };
}
