import { ChangeEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Alert, Badge, Button, Grid, Input, RadioGroup, Row, Stack } from '@photon-health/ui';
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
import { pathAfterStep } from '../conditions';
import { createPatient } from '../api/patient';
import { Sex } from '../api/types';
import { useIntake } from '../state/IntakeContext';

/**
 * Reached when the lookup finds nobody. Every field here is independently
 * required to create a patient — dropping one comes back as a rejected change
 * rather than a thrown error, so the form gates on all four.
 *
 * The created patient is linked to the caller's org (MASTER) inside the same
 * transaction; there is no second call to make.
 */

/**
 * The enum's third value, UNKNOWN, is not offered: it is also what the API
 * stores for "not answered", so anyone picking it would be written as though
 * they had skipped the question.
 */
const SEX_OPTIONS: { value: Sex; label: string }[] = [
  { value: 'FEMALE', label: 'Female' },
  { value: 'MALE', label: 'Male' }
];

export const NewProfile = () => {
  const { flow, phone, lastName: knownLastName, dateOfBirth: knownDob, setPatient } = useIntake();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState(knownLastName ?? '');
  const [dateOfBirth, setDateOfBirth] = useState(knownDob ?? '');
  const [sex, setSex] = useState<Sex | null>(null);
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  if (!phone) {
    return <Navigate to={`/start/${flow.slug}/verify`} replace />;
  }

  const ready =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    dateOfBirth.length === 10 &&
    sex !== null;

  const submit = async () => {
    if (!ready || !sex) return;
    setSubmitting(true);
    setError(undefined);
    try {
      const patient = await createPatient({
        phone,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth,
        sex
      });
      setPatient(patient);
      // Straight on — a patient created seconds ago has no history, so the
      // "welcome back" screen would have nothing to show.
      navigate(pathAfterStep(flow, 'verify'));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Page>
      <TopBar onBack={() => navigate(`/start/${flow.slug}/verify/details`)} />
      <Progress step="verify" />
      <Row>
        <Badge tone="success" dot>
          Number verified
        </Badge>
      </Row>
      <StepLabel step="verify" label="New profile" />
      <Heading>Let’s set up your profile</Heading>
      <Body>
        We didn’t find a Photon profile for this number. A few details so a provider can review your
        request.
      </Body>

      <Grid columns={2} gap="3">
        <Input
          label="First name"
          value={firstName}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setFirstName(event.target.value)}
          placeholder="Achilles"
          autoComplete="given-name"
        />
        <Input
          label="Last name"
          value={lastName}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setLastName(event.target.value)}
          placeholder="Rivera"
          autoComplete="family-name"
        />
      </Grid>

      {/* GAP: no date picker in the design system — Input with type="date". */}
      <Input
        label="Date of birth"
        value={dateOfBirth}
        onChange={(event: ChangeEvent<HTMLInputElement>) => setDateOfBirth(event.target.value)}
        type="date"
        autoComplete="bday"
      />

      <Stack gap="2">
        <RadioGroup
          label="Sex assigned at birth"
          options={SEX_OPTIONS}
          value={sex}
          onChange={setSex}
          horizontal
        />
        <Muted>Used for dosing and safety checks. You can add your gender identity later.</Muted>
      </Stack>

      {error ? <Alert tone="critical" title={error} /> : null}

      <Spacer />
      {/* `loading` shows the spinner but does not disable — both are needed. */}
      <Button disabled={!ready || submitting} loading={submitting} onClick={submit}>
        {submitting ? 'Creating…' : 'Create profile'}
      </Button>
      <Muted center>By continuing you agree to Photon’s Terms and Privacy Policy.</Muted>
    </Page>
  );
};
