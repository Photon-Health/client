import Client from './systems/Client';
import PharmacySearch from './systems/PharmacySearch';

const App = () => {
  return (
    <Client
      id="7N9QZujlNJHL8EIPqXpu1wq8OuXqoxKb"
      org="org_KzSVZBQixLRkqj5d"
      domain="auth.boson.health"
      audience="https://api.boson.health"
      uri="https://api.boson.health/graphql"
    >
      <PharmacySearch />
    </Client>
  );
};

export default App;
