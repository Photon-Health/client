import { createMemo, createSignal } from 'solid-js';
import PharmacySearch from './systems/PharmacySearch';
import { randomNames } from './sampleData/randomNames';
import Client from './systems/Client';

const App = () => {
  const [value, setValue] = createSignal(false);
  const [query, setQuery] = createSignal('');
  const filteredPeople = createMemo(() => {
    return query() === ''
      ? randomNames
      : randomNames.filter((person) => {
          return person.name.toLowerCase().includes(query().toLowerCase());
        });
  });

  return (
    <Client
      id="7N9QZujlNJHL8EIPqXpu1wq8OuXqoxKb"
      org="org_KzSVZBQixLRkqj5d"
      domain="auth.boson.health"
      audience="https://api.boson.health"
      uri="https://api.boson.health/graphql"
    >
      <div class="p-5" style={{ width: '600px' }}>
        <div class="p-5 border border-gray-300 rounded-md">
          <PharmacySearch />
        </div>
      </div>
    </Client>
  );
};

export default App;
