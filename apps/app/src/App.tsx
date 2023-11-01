import { useColorMode } from '@chakra-ui/react';

import { Routes, Route, BrowserRouter } from 'react-router-dom';

import { AppState } from '@auth0/auth0-react';
import { PhotonClient, PhotonProvider } from '@photonhealth/react';

import { Login } from './views/routes/Login';
import { Logout } from './views/routes/Logout';
import { Main } from './views/routes/Main';
import { NotFound } from './views/routes/NotFound';
import { Orders } from './views/routes/Orders';
import { Order } from './views/routes/Order';
import { Patient } from './views/routes/Patient';
import { Prescription } from './views/routes/Prescription';
import { PatientForm } from './views/routes/PatientForm';
import { PrescriptionForm } from './views/routes/PrescriptionForm';
import { Patients } from './views/routes/Patients';
import { Prescriptions } from './views/routes/Prescriptions';
import { Settings } from './views/routes/Settings';
import { Support } from './views/routes/Support';
import { UpdatePatientForm } from './views/routes/UpdatePatientForm';
import { NewOrder } from './views/routes/NewOrder';
import { Playground } from './views/routes/Playground';
import { auth0Config } from './configs/auth';
import { AlertDisplay } from './views/components/AlertDisplay';
import { useEffect } from 'react';
import { Zendesk } from './views/components/Zendesk';

const client = new PhotonClient({
  domain: auth0Config.domain,
  clientId: auth0Config.clientId,
  redirectURI: auth0Config.redirectUri,
  audience: auth0Config.audience,
  uri: process.env.REACT_APP_GRAPHQL_URI as string
});

const onRedirectCallback = (appState?: AppState) => {
  window.location.replace(appState?.returnTo || window.location.pathname);
};

export const App = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  useEffect(() => {
    // TODO: Remove this once we have a better solution for dark mode.
    // This will set anyones dark mode to light mode
    if (colorMode === 'dark') {
      toggleColorMode();
    }
  }, [colorMode]);

  return (
    <BrowserRouter>
      <PhotonProvider client={client} onRedirectCallback={onRedirectCallback}>
        <Zendesk />
        <AlertDisplay />
        <Routes>
          <Route path="/" element={<Main />}>
            <Route path="/patients">
              <Route path="/patients" element={<Patients />} />
              <Route path="new" element={<PatientForm />} />
              <Route path="update/:patientId" element={<UpdatePatientForm />} />
            </Route>
            <Route path="/patients/:patientId" element={<Patient />} />
            <Route path="/prescriptions">
              <Route path="/prescriptions" element={<Prescriptions />} />
              <Route path="new" element={<PrescriptionForm />} />
              <Route path=":prescriptionId" element={<Prescription />} />
            </Route>
            <Route path="/orders">
              <Route path="/orders" element={<Orders />} />
              <Route path="new" element={<NewOrder />} />
              <Route path=":orderId" element={<Order />} />
            </Route>
            <Route path="/support" element={<Support />} />
            <Route path="/playground" element={<Playground />} />
            <Route path="/settings" element={<Settings />}>
              <Route path="user" />
              <Route path="templates" />
              <Route path="catalog" />
            </Route>
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </PhotonProvider>
    </BrowserRouter>
  );
};
