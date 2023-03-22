import Client from './systems/Client';
import PharmacySearch from './systems/PharmacySearch';

const App = () => {
  return (
    <div class="w-1/2 p-10">
      <Client
        id="7N9QZujlNJHL8EIPqXpu1wq8OuXqoxKb"
        org="org_KzSVZBQixLRkqj5d"
        domain="auth.boson.health"
        audience="https://api.boson.health"
        uri="https://api.boson.health/graphql"
      >
        <PharmacySearch />
      </Client>
    </div>
  );
};

export default App;
