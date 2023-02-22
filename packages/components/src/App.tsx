import Button from './atoms/Button';

const App = () => {
  return (
    <article class="prose lg:prose-lg p-4">
      <h1 class="mb-0">Button</h1>

      <h3>Styles</h3>
      <div class="flex flex-wrap items-center justify-left gap-2 overflow-x-hidden bg-top">
        <Button style="primary">Primary</Button>
        <Button style="secondary">Secondary</Button>
        <Button style="accent">Accent</Button>
        <Button style="info">Info</Button>
        <Button style="success">Success</Button>
        <Button style="warning">Warning</Button>
        <Button style="error">Error</Button>
        <Button style="ghost">Ghost</Button>
        <Button style="link">Link</Button>
      </div>
      <h3>Sizes</h3>
      <div class="flex flex-wrap items-center justify-left gap-2 overflow-x-hidden bg-top">
        <Button style="primary" size="lg">
          Large
        </Button>
        <Button style="primary" size="md">
          Medium
        </Button>
        <Button style="primary" size="sm">
          Small
        </Button>
        <Button style="primary" size="xs">
          Extra Small
        </Button>
      </div>
      <h3>Outline</h3>
      <div class="flex flex-wrap items-center justify-left gap-2 overflow-x-hidden bg-top">
        <Button style="primary" isOutline>
          Primary
        </Button>
        <Button style="secondary" isOutline>
          Secondary
        </Button>
        <Button style="accent" isOutline>
          Accent
        </Button>
        <Button style="info" isOutline>
          Info
        </Button>
        <Button style="success" isOutline>
          Success
        </Button>
        <Button style="warning" isOutline>
          Warning
        </Button>
        <Button style="error" isOutline>
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
