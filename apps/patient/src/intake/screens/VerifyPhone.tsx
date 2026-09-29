import { ChangeEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { Button, Input } from '@photon-health/ui';
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
import { pathBeforeStep } from '../conditions';
import { useIntake } from '../state/IntakeContext';

/**
 * No code is generated, sent, stored or compared anywhere in this flow — the
 * next screen accepts any six digits. The flag keeps that out of any
 * environment where the medication history on the following screens would be
 * real PHI.
 */
export const FAKE_OTP_ENABLED = import.meta.env.VITE_INTAKE_FAKE_OTP === 'true';

const toE164 = (input: string) => parsePhoneNumberFromString(input, 'US')?.format('E.164');

export const VerifyPhone = () => {
  const { flow, setPhone } = useIntake();
  const navigate = useNavigate();
  const [input, setInput] = useState('');

  const e164 = toE164(input);

  if (!FAKE_OTP_ENABLED) {
    return (
      <Page>
        <TopBar onBack={() => navigate(pathBeforeStep(flow, 'verify'))} />
        <Heading>Not available</Heading>
        <Body>
          Phone verification is not wired up in this environment, so intake is disabled here.
        </Body>
      </Page>
    );
  }

  const sendCode = () => {
    if (!e164) return;
    setPhone(e164);
    navigate(`/start/${flow.slug}/verify/code`);
  };

  return (
    <Page>
      <TopBar onBack={() => navigate(pathBeforeStep(flow, 'verify'))} />
      <Progress step="verify" />
      <StepLabel step="verify" label="Verify" />
      <Heading>First, let’s verify it’s you</Heading>
      <Body>Enter your mobile number and we’ll text you a 6-digit code.</Body>

      <Input
        label="Mobile number"
        value={input}
        onChange={(event: ChangeEvent<HTMLInputElement>) => setInput(event.target.value)}
        placeholder="(303) 555-0142"
        helper="Message and data rates may apply."
        type="tel"
        inputMode="tel"
        autoComplete="tel"
      />

      <Spacer />
      <Button disabled={!e164} onClick={sendCode}>
        Send code
      </Button>
      <Muted center>By continuing you agree to Photon’s Terms and Privacy Policy.</Muted>
    </Page>
  );
};
