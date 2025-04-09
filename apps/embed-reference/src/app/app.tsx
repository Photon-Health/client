// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Link, Route, Routes } from 'react-router-dom';
import { EmbedApp1 } from './embeddables/EmbedApp1';

export function App() {
  return (
    <div>
      <div role="navigation">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/embed-ref-1">Embed Reference App 1</Link>
          </li>
          <li>
            <Link to="/embed-ref-2">Embed Reference App 2</Link>
          </li>
        </ul>
      </div>
      <Routes>
        <Route
          path="/"
          element={
            <div>
              This is the generated root route.{' '}
              <Link to="/embed-ref-1">Click here for embed app 1.</Link>
            </div>
          }
        />
        <Route path="/embed-ref-1" element={<EmbedApp1 />} />
        <Route
          path="/embed-ref-2"
          element={
            <div>
              <Link to="/">home</Link>
              <p>todo: embed app 2</p>
            </div>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
