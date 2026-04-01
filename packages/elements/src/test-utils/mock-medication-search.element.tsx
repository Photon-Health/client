import { TREATMENT } from '@photonhealth/sdk/test-utils';

// todo: remove this MockMedicationSearchElement
export class MockMedicationSearchElement extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === 'true') return;
    this.dataset.initialized = 'true';

    const label = this.getAttribute('label') || 'Search for Treatment';
    const wrapper = document.createElement('label');
    wrapper.textContent = label;

    const select = document.createElement('select');
    select.setAttribute('aria-label', label);

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Select treatment';
    select.append(placeholder);

    const option = document.createElement('option');
    option.value = TREATMENT.id;
    option.textContent = TREATMENT.name;
    select.append(option);

    select.addEventListener('change', () => {
      if (!select.value) {
        this.dispatchEvent(
          new CustomEvent('photon-treatment-unselected', { bubbles: true, composed: true })
        );
        return;
      }
      this.dispatchEvent(
        new CustomEvent('photon-search-text-changed', {
          bubbles: true,
          composed: true,
          detail: { text: TREATMENT.name }
        })
      );
      this.dispatchEvent(
        new CustomEvent('photon-treatment-selected', {
          bubbles: true,
          composed: true,
          detail: { data: TREATMENT, catalogId: 'cat_123' }
        })
      );
    });

    wrapper.append(select);
    this.append(wrapper);
  }
}
