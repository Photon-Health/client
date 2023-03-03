import { customElement } from 'solid-element';
import { Button } from '@photonhealth/components';
import photonStyles from '@photonhealth/components/dist/style.css?inline';

customElement(
  'photon-audit',
  {
    theme: 'theme-photon'
  },
  ({ theme }) => {
    return (
      <div class={`font-sans ${theme}`}>
        <style>{photonStyles}</style>

        <article class="prose lg:prose-lg p-4">
          <h1 class="mb-0">Buttons</h1>
          <p> THEME: {theme}</p>
          <h3>Variants</h3>
          <div class="flex flex-wrap items-center justify-left gap-2 overflow-x-hidden bg-top">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
          </div>
          <h3>Sizes</h3>
          <div class="flex flex-wrap items-center justify-left gap-2 overflow-x-hidden bg-top">
            <Button variant="primary" size="xl">
              X-Large
            </Button>
            <Button variant="primary" size="lg">
              Large
            </Button>
            <Button variant="primary" size="md">
              Medium
            </Button>
            <Button variant="primary" size="sm">
              Small
            </Button>
            <Button variant="primary" size="xs">
              Extra Small
            </Button>
          </div>
        </article>
      </div>
    );
  }
);
