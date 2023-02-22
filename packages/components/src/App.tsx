import Button from './atoms/Button';

const App = () => {
  return (
    <div>
      <Button style="primary">Primary Button</Button>
      <Button style="secondary">Secondary Button</Button>
      <Button style="accent">Accent Button</Button>
      <Button style="info">Info Button</Button>
      <Button style="success">Success Button</Button>
      <Button style="warning">Warning Button</Button>
      <Button style="error">Error Button</Button>
      <Button style="ghost">Ghost Button</Button>
      <Button style="link">Link Button</Button>
    </div>
  );
};

export default App;
