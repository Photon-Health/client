import { Navigate, useNavigate } from 'react-router-dom';
import { Button, Card, CardBody, CardHeader, RadioGroup } from '@photon-health/ui';
import { Body, Heading, Page, Progress, StepLabel, TopBar } from '../components/Layout';
import { MEDICATION_ANSWER_ID, pathAfterStep } from '../conditions';
import { useIntake } from '../state/IntakeContext';

export const MedicationChoice = () => {
  const { flow, answers, setAnswer } = useIntake();
  const navigate = useNavigate();

  // A flow without a choice screen never routes here.
  if (!flow.medicationChoice) {
    return <Navigate to={pathAfterStep(flow, 'medication')} replace />;
  }

  const config = flow.medicationChoice;
  const chosen = answers[MEDICATION_ANSWER_ID] ?? null;

  return (
    <Page>
      <TopBar onBack={() => navigate(-1)} />
      <Progress step="medication" />
      <StepLabel step="medication" label="Medication" />
      <Heading>{config.headline}</Heading>

      {/* GAP: RadioOption is { value, label } — no description or meta, unlike
          SelectOption and ComboboxOption — so the form-and-frequency line is
          concatenated into the label, the same workaround the pharmacy step
          uses for a candidate's reason.
          The heading is the question, per the comps, so it cannot also be the
          group's label; RadioGroup has no aria-labelledby and no hidden-label
          option, so the group goes unnamed for assistive tech. */}
      <RadioGroup
        options={config.options.map((option) => ({
          value: option.value,
          label: `${option.label} · ${option.detail}`
        }))}
        value={chosen}
        onChange={(value) => setAnswer(MEDICATION_ANSWER_ID, value)}
      />

      <Card variant="sunken">
        <CardHeader title={config.noteTitle} titleAs="h2" />
        <CardBody>
          <Body>{config.noteBody}</Body>
        </CardBody>
      </Card>

      <Button disabled={!chosen} onClick={() => navigate(pathAfterStep(flow, 'medication'))}>
        Continue
      </Button>
    </Page>
  );
};
