import { Route } from 'react-router-dom';
import { Main } from './views/Main';
import { Review } from './views/Review';
import { ReadyBy } from './views/ReadyBy';
import { Pharmacy } from './views/Pharmacy';
import { Status } from './views/Status';
import { Canceled } from './views/Canceled';
import { NoMatch } from './views/NoMatch';
import { InfoPage } from './views/Info';

export const routeElements = (
  <Route>
    <Route path="/" element={<Main />}>
      <Route path="/review" element={<Review />} />
      <Route path="/readyBy" element={<ReadyBy />} />
      <Route path="/pharmacy" element={<Pharmacy />} />
      <Route path="/status" element={<Status />} />
      {/* Leaving this here in case we need to roll back */}
      {/* <Route path="/status" element={<Status />} /> */}
      <Route path="/canceled" element={<Canceled />} />
    </Route>
    <Route path="/info" element={<InfoPage />} />
    <Route path="*" element={<NoMatch />} />
  </Route>
);
