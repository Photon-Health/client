import Client from './systems/Client';
import Test from './systems/Test';

const App = () => {
  return (
    <Client
      id="7N9QZujlNJHL8EIPqXpu1wq8OuXqoxKb"
      org="org_KzSVZBQixLRkqj5d"
      domain="auth.boson.health"
      audience="https://api.boson.health"
      uri="https://api.boson.health/graphql"
    >
      <Test />
    </Client>
  );
};

export default App;
