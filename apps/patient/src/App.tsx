import { Routes, Route, BrowserRouter } from 'react-router-dom'

import { Main } from './views/Main'
import { Status } from './views/Status'
import { NoMatch } from './views/NoMatch'
import { Pharmacy } from './views/Pharmacy'

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />}>
          <Route path="/pharmacy" element={<Pharmacy />} />
          <Route path="/status" element={<Status />} />
        </Route>
        <Route path="*" element={<NoMatch />} />
      </Routes>
    </BrowserRouter>
  )
}
