import { Routes, Route, BrowserRouter } from 'react-router-dom'

import { Main } from './views/Main'
import { Status } from './views/Status'
import { NoMatch } from './views/NoMatch'
import { Pharmacy } from './views/Pharmacy'
import { Review } from './views/Review'
import { ReadyBy } from './views/ReadyBy'

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />}>
          <Route path="/ready" element={<ReadyBy />} />
          <Route path="/review" element={<Review />} />
          <Route path="/pharmacy" element={<Pharmacy />} />
          <Route path="/status" element={<Status />} />
        </Route>
        <Route path="*" element={<NoMatch />} />
      </Routes>
    </BrowserRouter>
  )
}
