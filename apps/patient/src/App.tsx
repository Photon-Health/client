import { Routes, Route, BrowserRouter } from 'react-router-dom';

import { Main } from './views/Main';
import { Status } from './views/Status';
import { NoMatch } from './views/NoMatch';
import { Pharmacy } from './views/Pharmacy';
import { Reroute } from './views/Reroute';
import { Review } from './views/Review';
import { Canceled } from './views/Canceled';

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />}>
          <Route path="/review" element={<Review />} />
          <Route path="/pharmacy" element={<Pharmacy />} />
          <Route path="/reroute" element={<Reroute />} />
          <Route path="/status" element={<Status />} />
          <Route path="/canceled" element={<Canceled />} />
        </Route>
        <Route path="*" element={<NoMatch />} />
      </Routes>
    </BrowserRouter>
  );
};
