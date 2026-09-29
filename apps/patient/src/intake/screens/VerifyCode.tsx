import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { Button, Row, Stack } from '@photon-health/ui';
import {
  Body,
  Heading,
  Muted,
  Page,
  Progress,
  Spacer,
  StepLabel,
  TopBar
} from '../components/Layout';
import { CODE_LENGTH, CodeInput } from '../components/CodeInput';
import { useIntake } from '../state/IntakeContext';

const RESEND_SECONDS = 24;

export const VerifyCode = () => {
  const { flow, phone } = useIntake();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  if (!phone) {
    return <Navigate to={`/start/${flow.slug}/verify`} replace />;
  }

  const display = parsePhoneNumberFromString(phone)?.formatNational() ?? phone;

  // Any six digits pass — there is nothing to compare against.
  const complete = code.length === CODE_LENGTH;

  return (
    <Page>
      <TopBar onBack={() => navigate(`/start/${flow.slug}/verify`)} />
      <Progress step="verify" />
      <StepLabel step="verify" label="Verify" />
      <Heading>Enter the code we sent</Heading>
      <Body>Sent to {display}.</Body>

      {/* Hand-built field shell: the design system has no one-time-code input,
          and its Field shell is not exported for wrapping a custom control. */}
      <Stack gap="2">
        <span className="type-app-input-label">6-digit code</span>
        <CodeInput value={code} onChange={setCode} />
        <span className="type-app-input-helper text-[var(--text-tertiary)]">
          {secondsLeft > 0
            ? `Didn’t get it? Resend in 0:${String(secondsLeft).padStart(2, '0')}`
            : 'Didn’t get it? Resend code'}
        </span>
      </Stack>

      <Row>
        <Button variant="ghost" size="sm" onClick={() => navigate(`/start/${flow.slug}/verify`)}>
          Change number
        </Button>
      </Row>

      <Spacer />
      <Button disabled={!complete} onClick={() => navigate(`/start/${flow.slug}/verify/details`)}>
        Verify
      </Button>
      <Muted center>By continuing you agree to Photon’s Terms and Privacy Policy.</Muted>
    </Page>
  );
};
