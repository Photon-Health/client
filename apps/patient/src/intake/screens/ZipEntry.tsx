import { ChangeEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
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
import { useIntake } from '../state/IntakeContext';

/**
 * Copied rather than imported: the canonical rule is `zipCodeRegex` in
 * packages/components/src/utils/regex.ts, which apps/patient may not import
 * across the Solid/React JSX boundary — and this directory is meant to lift
 * out with no workspace imports anyway.
 */
const ZIP_PATTERN = /^[0-9]{5}(?:-[0-9]{4})?$/;

/**
 * Reached only when the patient record carries no postal code. The API
 * geocodes the zip server-side, so there is no Maps SDK in this tree.
 */
export const ZipEntry = () => {
  const { flow, patient, prescriptionId, setPostalCode } = useIntake();
  const navigate = useNavigate();

  const [zip, setZip] = useState('');
  const [touched, setTouched] = useState(false);

  if (!patient || !prescriptionId) {
    return <Navigate to={`/start/${flow.slug}/verify`} replace />;
  }

  const valid = ZIP_PATTERN.test(zip.trim());

  const submit = () => {
    if (!valid) return;
    setPostalCode(zip.trim());
    navigate(`/start/${flow.slug}/pharmacy`);
  };

  return (
    <Page>
      <TopBar onBack={() => navigate(-1)} />
      <Progress step="pharmacy" />
      <StepLabel step="pharmacy" label="Pharmacy" />
      <Heading>Where are you picking up?</Heading>
      <Body>We don’t have an address on file, so tell us where to look for pharmacies.</Body>

      <Input
        label="ZIP code"
        value={zip}
        onChange={(event: ChangeEvent<HTMLInputElement>) => setZip(event.target.value)}
        onBlur={() => setTouched(true)}
        placeholder="80202"
        inputMode="numeric"
        autoComplete="postal-code"
        maxLength={10}
        invalid={touched && zip.length > 0 && !valid}
        errorMessage="Enter a 5-digit ZIP code."
      />

      <Spacer />
      <Button disabled={!valid} onClick={submit}>
        Continue
      </Button>
      <Muted center>We only use this to find pharmacies near you.</Muted>
    </Page>
  );
};
