import { customElement } from 'solid-element';
import { PharmacySearch } from '@photonhealth/components';
import { usePhoton } from '../context';

customElement('photon-audit', {}, () => {
  return (
    <div>
      <PharmacySearch uP={usePhoton} />
    </div>
  );
});
