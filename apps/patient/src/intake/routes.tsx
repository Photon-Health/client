import { Outlet, Route, useParams } from 'react-router-dom';
// The design system, loaded here rather than in the app's entry point so the
// lift-out contract stays one route mount. tokens.css is variables and type
// classes only — no reset — so it cannot leak into the Chakra views.
import '@photon-health/tokens/tokens.css';
import '@photon-health/tokens/fonts.css';
import '@photon-health/ui/styles.css';
import './intake.css';
import { getConditionFlow } from './conditions';
import { IntakeProvider } from './state/IntakeContext';
import { Body, Heading, Page, TopBar } from './components/Layout';
import { Landing } from './screens/Landing';
import { Eligibility } from './screens/Eligibility';
import { VerifyPhone } from './screens/VerifyPhone';
import { VerifyCode } from './screens/VerifyCode';
import { VerifyDetails } from './screens/VerifyDetails';
import { NewProfile } from './screens/NewProfile';
import { WelcomeBack } from './screens/WelcomeBack';
import { HealthHistory } from './screens/HealthHistory';
import { MedicationChoice } from './screens/MedicationChoice';
import { RxPreview } from './screens/RxPreview';
import { ZipEntry } from './screens/ZipEntry';
import { PharmacySelect } from './screens/PharmacySelect';
import { Submitted } from './screens/Submitted';
import { Unresolved } from './screens/Unresolved';

const IntakeRoot = () => {
  const { condition } = useParams();
  const flow = getConditionFlow(condition);

  if (!flow) {
    return (
      <Page>
        <TopBar />
        <Heading>Not found</Heading>
        <Body>We don’t have a request flow for that treatment.</Body>
      </Page>
    );
  }

  return (
    <IntakeProvider flow={flow}>
      <Outlet />
    </IntakeProvider>
  );
};

/**
 * Mounted above `Main` in the app's route tree. Nothing here goes through
 * Main's order-token gate or the app's shared GraphQL client.
 */
export const intakeRouteElements = (
  <Route path="/start/:condition" element={<IntakeRoot />}>
    <Route index element={<Landing />} />
    <Route path="eligibility" element={<Eligibility />} />
    <Route path="verify" element={<VerifyPhone />} />
    <Route path="verify/code" element={<VerifyCode />} />
    <Route path="verify/details" element={<VerifyDetails />} />
    <Route path="verify/profile" element={<NewProfile />} />
    <Route path="history" element={<WelcomeBack />} />
    <Route path="questions" element={<HealthHistory />} />
    <Route path="medication" element={<MedicationChoice />} />
    <Route path="review" element={<RxPreview />} />
    <Route path="location" element={<ZipEntry />} />
    <Route path="pharmacy" element={<PharmacySelect />} />
    <Route path="submitted" element={<Submitted />} />
    <Route path="unresolved" element={<Unresolved />} />
  </Route>
);
