import { customElement } from 'solid-element';
import x from '@shoelace-style/shoelace/dist/components/spinner/spinner.js';
console.log(x);
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.4.0/dist/');

customElement('photon-audit', {}, () => {
  return (
    <div>
      <sl-spinner style="font-size: 3rem;"></sl-spinner>
    </div>
  );
});
