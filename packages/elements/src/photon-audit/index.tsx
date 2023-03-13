import { customElement } from 'solid-element';
import { Test } from '@photonhealth/components';
import { usePhoton } from '../context';

customElement('photon-audit', {}, () => {
  return (
    <div>
      <Test uP={usePhoton} />
    </div>
  );
});
