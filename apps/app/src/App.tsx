import { useColorMode } from '@chakra-ui/react';

import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { AppState } from '@auth0/auth0-react';
import { PhotonClient, PhotonProvider } from '@photonhealth/react';

import { useEffect } from 'react';
import { auth0Config } from './configs/auth';
import { AlertDisplay } from './views/components/AlertDisplay';
import { Login } from './views/routes/Login';
import { Logout } from './views/routes/Logout';
import { Main } from './views/routes/Main';
import { NewOrder } from './views/routes/NewOrder';
import { NotFound } from './views/routes/NotFound';
import { Order } from './views/routes/Order';
import { Orders } from './views/routes/Orders';
import { Patient } from './views/routes/Patient';
import { PatientForm } from './views/routes/PatientForm';
import { Patients } from './views/routes/Patients';
import { Playground } from './views/routes/Playground';
import { Prescription } from './views/routes/Prescription';
import { PrescriptionForm } from './views/routes/PrescriptionForm';
import { Prescriptions } from './views/routes/Prescriptions';
import { Settings } from './views/routes/Settings';
import { Support } from './views/routes/Support';
import { UpdatePatientForm } from './views/routes/UpdatePatientForm';
import { Env } from '@photonhealth/sdk';

const env = process.env.REACT_APP_ENV_NAME as Env;

const client = new PhotonClient({
  env,
  domain: auth0Config.domain,
  clientId: auth0Config.clientId,
  redirectURI: auth0Config.redirectUri
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
      <PhotonProvider env={env} client={client} onRedirectCallback={onRedirectCallback}>
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
            <Route path="/playground" element={<Playground />} />={' '}
            <Route path="/settings" element={<Settings />}>
              <Route path="user" />
              <Route path="team" />
              <Route path="organization" />
              <Route path="developers" />
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
