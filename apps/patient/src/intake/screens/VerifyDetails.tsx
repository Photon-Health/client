import { ChangeEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Alert, Button, Input } from '@photon-health/ui';
import { Body, Heading, Page, Progress, Spacer, StepLabel, TopBar } from '../components/Layout';
import { lookupPatient } from '../api/patient';
import { useIntake } from '../state/IntakeContext';

/**
 * Last name and date of birth are not optional detail: matching needs two
 * signals, and phone on its own scores one, so a lookup without them always
 * comes back AMBIGUOUS.
 */
export const VerifyDetails = () => {
  const { flow, phone, setIdentity, setPatient } = useIntake();
  const navigate = useNavigate();

  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  if (!phone) {
    return <Navigate to={`/start/${flow.slug}/verify`} replace />;
  }

  const ready = lastName.trim().length > 0 && dateOfBirth.length === 10;

  const submit = async () => {
    if (!ready) return;
    setSubmitting(true);
    setError(undefined);
    try {
      const result = await lookupPatient({ phone, lastName: lastName.trim(), dateOfBirth });
      setIdentity({ lastName: lastName.trim(), dateOfBirth });

      if (result.kind === 'matched') {
        setPatient(result.patient);
        navigate(`/start/${flow.slug}/history`);
        return;
      }
      if (result.kind === 'notFound') {
        navigate(`/start/${flow.slug}/verify/profile`);
        return;
      }
      // Ambiguous still dead-ends: creating a second record for someone who
      // may already have one is worse than stopping.
      navigate(`/start/${flow.slug}/unresolved`, {
        state: { kind: 'ambiguous', reason: result.reason }
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Page>
      <TopBar onBack={() => navigate(`/start/${flow.slug}/verify/code`)} />
      <Progress step="verify" />
      <StepLabel step="verify" label="Verify" />
      <Heading>And a couple of details</Heading>
      <Body>
        We use these to find your Photon record. They need to match what your provider has on file.
      </Body>

      <Input
        label="Last name"
        value={lastName}
        onChange={(event: ChangeEvent<HTMLInputElement>) => setLastName(event.target.value)}
        placeholder="Ortiz"
        autoComplete="family-name"
      />
      {/* GAP: no date picker in the design system — Input with type="date". */}
      <Input
        label="Date of birth"
        value={dateOfBirth}
        onChange={(event: ChangeEvent<HTMLInputElement>) => setDateOfBirth(event.target.value)}
        type="date"
        autoComplete="bday"
      />

      {error ? <Alert tone="critical" title={error} /> : null}

      <Spacer />
      {/* `loading` shows the spinner but does not disable — both are needed. */}
      <Button disabled={!ready || submitting} loading={submitting} onClick={submit}>
        {submitting ? 'Checking…' : 'Continue'}
      </Button>
    </Page>
  );
};
