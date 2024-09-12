import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider
} from 'react-router-dom';

import { Canceled } from './views/Canceled';
import { Main } from './views/Main';
import { NoMatch } from './views/NoMatch';
import { Pharmacy } from './views/Pharmacy';
import { ReadyBy } from './views/ReadyBy';
import { Review } from './views/Review';
import { StatusV2 } from './views/StatusV2';
import { Status } from './views/Status';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path="/" element={<Main />}>
        <Route path="/review" element={<Review />} />
        <Route path="/readyBy" element={<ReadyBy />} />
        <Route path="/pharmacy" element={<Pharmacy />} />
        <Route path="/status" element={<Status />} />
        <Route path="/statusV2" element={<StatusV2 />} />
        <Route path="/canceled" element={<Canceled />} />
      </Route>
      <Route path="*" element={<NoMatch />} />
    </Route>
  )
);

export const App = () => {
  return <RouterProvider router={router} />;
};
