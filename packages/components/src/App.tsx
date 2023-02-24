import Button from './atoms/Button';

const App = () => {
  return (
    <article class="prose lg:prose-lg p-4">
      <h1 class="mb-0">Button</h1>

      <h3>Variants</h3>
      <div class="flex flex-wrap items-center justify-left gap-2 overflow-x-hidden bg-top">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="accent">Accent</Button>
        <Button variant="info">Info</Button>
        <Button variant="success">Success</Button>
        <Button variant="warning">Warning</Button>
        <Button variant="error">Error</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </div>
      <h3>Sizes</h3>
      <div class="flex flex-wrap items-center justify-left gap-2 overflow-x-hidden bg-top">
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
      <h3>Outline</h3>
      <div class="flex flex-wrap items-center justify-left gap-2 overflow-x-hidden bg-top">
        <Button variant="primary" isOutline>
          Primary
        </Button>
        <Button variant="secondary" isOutline>
          Secondary
        </Button>
        <Button variant="accent" isOutline>
          Accent
        </Button>
        <Button variant="info" isOutline>
          Info
        </Button>
        <Button variant="success" isOutline>
          Success
        </Button>
        <Button variant="warning" isOutline>
          Warning
        </Button>
        <Button variant="error" isOutline>
          Error
        </Button>
      </div>

      <h3>Loading</h3>
      <div class="flex flex-wrap items-center justify-left gap-2 overflow-x-hidden bg-top">
        <Button isLoading isDisabled>
          Loading
        </Button>
      </div>
    </article>
  );
};

export default App;
