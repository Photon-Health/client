import { Box, HStack, Text } from '@chakra-ui/react';
import { useSearchParams } from 'react-router-dom';
import { auth0Config } from '../../../../configs/auth';
import { trackSelfSignupEvent } from '../../../../configs/analytics';
import { SignupFormData } from './form';
import { useEffect, useMemo } from 'react';
import { SignupForm } from './SignupForm';
import { UnverifiedUserAlert } from './UnverifiedUserAlert';

const VALID_LICENSES = new Set(['MD', 'DO', 'PA', 'NP']);

export const SelfSignupPage = () => {
  const [searchParams] = useSearchParams();

  const state = searchParams.get('state') ?? undefined;
  const sessionToken = searchParams.get('session_token') ?? undefined;

  if (!state) {
    return <div>Error: no state</div>;
  }

  const {
    firstName,
    lastName,
    email,
    npi,
    phone,
    verified,
    credentials,
    supportEmail,
    customerAppName,
    customerAgreementPrefix
  } = useMemo(() => extractTokenData(sessionToken), [sessionToken]);
  const canPrefillNpi = !!(npi && npi?.length === 10);
  const isVerifiedPrescriber = verified && VALID_LICENSES.has(credentials ?? 'none');

  const initialFormData: SignupFormData = {
    firstName: firstName || '',
    lastName: lastName || '',
    email: email || '',
    npi: npi || '',
    phone: phone || '',
    street1: '',
    street2: '',
    city: '',
    state: '',
    postalCode: '',
    didAgreeToTerms: false
  };

  const submitForm = async (values: SignupFormData) => {
    await trackSelfSignupEvent(
      'Self Signup Page Submitted',
      {
        hasNpi: !!values.npi,
        hasPhone: !!values.phone,
        hasStreet2: !!values.street2,
        didAgreeToTerms: values.didAgreeToTerms
      },
      sessionToken
    );

    // set a flag in local storage to signify this is the inital login from self signup
    localStorage.setItem('selfSignupInitialLogin', 'true');

    await wait(100);

    const queryParams = buildSignupContinueParams(state, values);
    window.location.href = `https://${auth0Config.domain}/continue?${queryParams}`;
  };

  // Track page view on mount
  useEffect(() => {
    const hasPrefilledName = !!(firstName && lastName);
    const fullName = hasPrefilledName ? `${firstName} ${lastName}` : undefined;
    trackSelfSignupEvent(
      'Self Signup Page Viewed',
      {
        credentials,
        isExternallyVerified: verified,
        hasPrefilledNpi: canPrefillNpi,
        hasPrefilledEmail: !!email,
        hasPrefilledName,
        fullName
      },
      sessionToken
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only track once on mount - these values are derived from URL params and won't change

  return (
    <Box bg="white">
      <Box>
        {isVerifiedPrescriber ? (
          <SignupForm
            initialFormData={initialFormData}
            canPrefillNpi={canPrefillNpi}
            supportEmail={supportEmail}
            customerAgreementPrefix={customerAgreementPrefix}
            onSubmit={submitForm}
          />
        ) : (
          <UnverifiedUserAlert supportEmail={supportEmail} />
        )}
      </Box>
      <HStack justify="center" spacing="1" py="4" mb="32px">
        <Text fontSize="xs" color="gray.800">
          {customerAppName ? `${customerAppName} powered by Photon` : 'Powered by Photon'}
        </Text>
      </HStack>
    </Box>
  );
};

type SelfSignupFormPrefillData = {
  firstName?: string;
  lastName?: string;
  email?: string;
  npi?: string;
  phone?: string;
  verified?: boolean;
  credentials?: string;
  supportEmail?: string;
  customerAppName?: string;
  customerAgreementPrefix?: string;
};

function extractTokenData(tosSessionToken?: string): SelfSignupFormPrefillData {
  if (!tosSessionToken) {
    return {};
  }
  const [, payload] = tosSessionToken.split('.');
  const decodedPayload = JSON.parse(atob(payload));

  const firstName: string = decodedPayload.first_name;
  const lastName: string = decodedPayload.last_name;
  const email: string = decodedPayload.email;
  const npi: string | undefined = decodedPayload.npi ? String(decodedPayload.npi) : undefined;
  const phone: string | undefined = decodedPayload.phone
    ? formatPhoneToTenDigits(decodedPayload.phone)
    : undefined;

  const verified: boolean = decodedPayload.verified ?? false;
  const credentials: string | undefined = decodedPayload.credentials;
  const supportEmail: string | undefined = decodedPayload.supportEmail;
  const customerAppName: string | undefined = decodedPayload.customerAppName;
  const customerAgreementPrefix: string | undefined = decodedPayload.customerAgreementPrefix;

  if (!npi || !firstName || !lastName || !email || !phone) {
    const missingFields = [];
    if (!npi) missingFields.push('npi');
    if (!firstName) missingFields.push('firstName');
    if (!lastName) missingFields.push('lastName');
    if (!email) missingFields.push('email');
    if (!phone) missingFields.push('phone');
    // TODO: Can we remove this console?
    // logging this so we can see occurrences in DataDog RUM
    console.warn(`Prefill data missing from token for ${email}: ${missingFields.join(', ')}`);
  }

  if (!verified || !VALID_LICENSES.has(credentials ?? 'none')) {
    console.error(`Non verified prescriber attempted to sign up`, decodedPayload);
  }

  return {
    firstName,
    lastName,
    email,
    npi,
    phone,
    verified,
    credentials,
    supportEmail,
    customerAppName,
    customerAgreementPrefix
  };
}

function formatPhoneToTenDigits(phone: string | number): string {
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) {
    return digits.slice(1);
  }
  return digits;
}

const buildSignupContinueParams = (state: string, formData: SignupFormData): string => {
  const params = new URLSearchParams({
    state,
    first_name: formData.firstName,
    last_name: formData.lastName,
    email: formData.email,
    npi: formData.npi,
    phone: formData.phone,
    street1: formData.street1,
    city: formData.city,
    state_address: formData.state,
    postal_code: formData.postalCode,
    did_accept_tos: formData.didAgreeToTerms.toString(),
    // these version numbers must match an entry in the attestations table
    // otherwise an error will occur during signup
    tos_version: '1.0.0',
    baa_version: '1.0.0'
  });

  if (formData.street2) {
    params.set('street2', formData.street2);
  }

  return params.toString();
};

async function wait(number: number) {
  return new Promise((resolve) => setTimeout(resolve, number));
}
