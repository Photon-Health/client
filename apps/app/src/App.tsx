import { useColorMode } from '@chakra-ui/react';

import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { AppState } from '@auth0/auth0-react';
import { PhotonClient, PhotonProvider } from '@photonhealth/react';

import { useEffect } from 'react';
import { auth0Config } from './configs/auth';
import { ProviderAnalyticsProvider } from './hooks/useProviderAnalytics';
import { Login } from './views/routes/Login';
import { SSOLogin } from './views/routes/SSOLogin';
import { Logout } from './views/routes/Logout';
import { Main } from './views/routes/Main';
import { NewOrder } from './views/routes/NewOrder';
import { NotFound } from './views/routes/NotFound';
import { OrderDetailPage } from './views/routes/Order';
import { Orders } from './views/routes/Orders';
import { Patient } from './views/routes/PatientDetails';
import { PatientForm } from './views/routes/NewPatient/PatientForm';
import { Patients } from './views/routes/Patients';
import { Playground } from './views/routes/Playground';
import { Prescription } from './views/routes/Prescription';
import { PrescriptionForm } from './views/routes/PrescriptionForm';
import { Prescriptions } from './views/routes/Prescriptions';
import { Settings } from './views/routes/Settings';
import { Support } from './views/routes/Support';
import { UpdatePatientForm } from './views/routes/UpdatePatientForm';
import { Env } from '@photonhealth/sdk';
import { SelfSignupPage } from './views/routes/SelfSignup';
import { AppOverride } from './views/routes/AppOverride';

const env = import.meta.env.VITE_ENV_NAME as Env;

const client = new PhotonClient({
  env,
  domain: auth0Config.domain,
  clientId: auth0Config.clientId,
  redirectURI: auth0Config.redirectUri
});

const onRedirectCallback = (appState?: AppState) => {
  let returnTo = localStorage.getItem('authReturnTo');
  localStorage.removeItem('authReturnTo');
  if (!returnTo) {
    returnTo = appState?.returnTo || window.location.pathname;
  }
  window.location.replace(returnTo);
};

export const App = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  useEffect(() => {
    // TODO: Remove this once we have a better solution for dark mode.
    if (colorMode === 'dark') {
      toggleColorMode();
    }
  }, [colorMode]);

  return (
    <BrowserRouter>
      <PhotonProvider env={env} client={client} onRedirectCallback={onRedirectCallback}>
        <ProviderAnalyticsProvider>
          <Routes>
            <Route path="/" element={<Main />}>
              <Route element={<AppOverride />}>
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
                  <Route path=":orderId" element={<OrderDetailPage />} />
                </Route>
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
            <Route path="/sso" element={<SSOLogin />} />
            <Route path="/signup" element={<SelfSignupPage />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ProviderAnalyticsProvider>
      </PhotonProvider>
    </BrowserRouter>
  );
};
