import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Alert, Badge, Button, Card, CardBody, CardHeader, Row, Stack } from '@photon-health/ui';
import { Body, Heading, Page, Progress, StepLabel, TopBar } from '../components/Layout';
import { resolveTreatment } from '../conditions';
import { draftPrescription } from '../api/prescription';
import { useIntake } from '../state/IntakeContext';

export const RxPreview = () => {
  const { flow, patient, answers, setPrescriptionId } = useIntake();
  const navigate = useNavigate();
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  if (!patient) {
    return <Navigate to={`/start/${flow.slug}/verify`} replace />;
  }

  // A medication preference can carry its own drug; otherwise this is the
  // condition's default.
  const treatment = resolveTreatment(flow, answers);

  const submit = async () => {
    setSubmitting(true);
    setError(undefined);
    try {
      const prescriptionId = await draftPrescription({ patientId: patient.id, treatment });
      setPrescriptionId(prescriptionId);
      // No address on file means no search origin, so ask for a zip first.
      // A patient created at verify/profile never has one.
      navigate(
        patient.address?.postalCode
          ? `/start/${flow.slug}/pharmacy`
          : `/start/${flow.slug}/location`
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const details = [
    { label: 'Quantity', value: `${treatment.quantity} ${treatment.unit}` },
    { label: 'Directions', value: treatment.instructions },
    { label: 'Refills', value: treatment.refillsAllowed === 0 ? 'None' : treatment.refillsAllowed }
  ];

  return (
    <Page>
      <TopBar onBack={() => navigate(-1)} />
      <Progress step="review" />
      <StepLabel step="review" label="Review" />
      <Row>
        <Badge tone="warning">Draft request · not a prescription yet</Badge>
      </Row>
      <Heading>Here’s what we’ll send for review</Heading>

      <Card>
        <CardHeader title={treatment.displayName} />
        <CardBody>
          <Stack gap="3">
            {details.map((detail) => (
              <Row gap="4" justify="between" align="start" key={detail.label}>
                <span className="type-app-body-regular text-[var(--text-tertiary)]">
                  {detail.label}
                </span>
                <span className="type-app-body-medium text-right">{detail.value}</span>
              </Row>
            ))}
          </Stack>
        </CardBody>
      </Card>

      <Card variant="sunken">
        <CardHeader title="What happens next" />
        <CardBody>
          <Body>
            A licensed provider reviews your answers. They may approve, adjust the dose, ask you a
            question, or suggest another option.
          </Body>
        </CardBody>
      </Card>

      {error ? <Alert tone="critical" title={error} /> : null}

      <Button disabled={submitting} loading={submitting} onClick={submit}>
        {submitting ? 'Saving…' : 'Choose a pharmacy'}
      </Button>
      <Button variant="ghost" onClick={() => navigate(-1)}>
        Edit my answers
      </Button>
    </Page>
  );
};
