import { useColorMode } from '@chakra-ui/react';

import { BrowserRouter, Route, Routes } from 'react-router-dom';

<<<<<<< HEAD
import { AppState } from '@auth0/auth0-react';
import { PhotonClient, PhotonProvider } from '@photonhealth/react';

import { useEffect } from 'react';
import { auth0Config } from './configs/auth';
import { AlertDisplay } from './views/components/AlertDisplay';
import { Zendesk } from './views/components/Zendesk';
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
import { ClinicalApiProvider } from './views/routes/Settings/apollo';
import { Support } from './views/routes/Support';
import { UpdatePatientForm } from './views/routes/UpdatePatientForm';

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
=======
import { useEffect } from 'react';
import { SesameApp } from './Sesame/OrySesameApp';
import { NotFound } from './views/routes/NotFound';
>>>>>>> 3e28cd4 (temp)

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
<<<<<<< HEAD
      <PhotonProvider client={client} onRedirectCallback={onRedirectCallback}>
        <ClinicalApiProvider photonClient={client}>
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
        </ClinicalApiProvider>
      </PhotonProvider>
=======
      <Routes>
        <Route path="/" element={<SesameApp />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
>>>>>>> 3e28cd4 (temp)
    </BrowserRouter>
  );
};
