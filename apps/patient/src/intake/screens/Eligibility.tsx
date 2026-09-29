import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  Checkbox,
  Grid,
  Input,
  Row,
  Stack
} from '@photon-health/ui';
import { Heading, Page, Progress, StepLabel, TopBar } from '../components/Layout';
import { pathAfterStep, pathBeforeStep } from '../conditions';
import { useIntake } from '../state/IntakeContext';

const toNumber = (value: string) => (value.trim() === '' ? NaN : Number(value));

/** Imperial BMI. Rounded to one decimal, which is how the comps show it. */
export const bmiFor = (heightInches: number, weightPounds: number) =>
  Math.round(((weightPounds * 703) / (heightInches * heightInches)) * 10) / 10;

export const Eligibility = () => {
  const { flow, setEligibility } = useIntake();
  const navigate = useNavigate();

  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');
  const [pounds, setPounds] = useState('');
  const [conditions, setConditions] = useState<string[]>([]);

  // A flow without a screener never routes here, so there is nothing to show.
  if (!flow.eligibility) {
    return <Navigate to={pathAfterStep(flow, 'eligibility')} replace />;
  }

  const config = flow.eligibility;
  const feetValue = toNumber(feet);
  // Inches left blank reads as a round number of feet, not as unanswered.
  const inchesValue = inches.trim() === '' ? 0 : toNumber(inches);
  const poundsValue = toNumber(pounds);

  const heightInches = feetValue * 12 + inchesValue;
  const measured =
    Number.isFinite(heightInches) &&
    heightInches > 0 &&
    Number.isFinite(poundsValue) &&
    poundsValue > 0;

  const bmi = measured ? bmiFor(heightInches, poundsValue) : null;
  const meetsCriteria =
    bmi !== null &&
    (bmi >= config.bmiThreshold ||
      (bmi >= config.bmiThresholdWithCondition && conditions.length > 0));

  const toggle = (value: string, checked: boolean) =>
    setConditions((prev) => (checked ? [...prev, value] : prev.filter((it) => it !== value)));

  const submit = () => {
    if (bmi === null) return;
    setEligibility({
      heightInches,
      weightPounds: poundsValue,
      bmi,
      conditions,
      meetsCriteria
    });
    navigate(pathAfterStep(flow, 'eligibility'));
  };

  return (
    <Page>
      <TopBar onBack={() => navigate(pathBeforeStep(flow, 'eligibility'))} />
      <Progress step="eligibility" />
      <StepLabel step="eligibility" label="Eligibility" />
      <Heading>{config.headline}</Heading>

      {/* GAP: no composite measurement input, and Input owns its own label —
          so the shared "Height" label is the class Input itself uses and the
          two boxes are named for assistive tech instead. A single "5 ft 9 in"
          box as drawn would need parsing the comps do not specify. */}
      <Grid min="150px" gap="4">
        <Stack gap="2">
          <span className="type-app-input-label">Height</span>
          <Row gap="2" wrap={false}>
            <Input
              aria-label="Height in feet"
              type="number"
              inputMode="numeric"
              min={1}
              affix="ft"
              value={feet}
              onChange={(event) => setFeet(event.target.value)}
            />
            <Input
              aria-label="Height in inches"
              type="number"
              inputMode="numeric"
              min={0}
              max={11}
              affix="in"
              value={inches}
              onChange={(event) => setInches(event.target.value)}
            />
          </Row>
        </Stack>
        <Input
          label="Weight"
          type="number"
          inputMode="numeric"
          min={1}
          affix="lb"
          value={pounds}
          onChange={(event) => setPounds(event.target.value)}
        />
      </Grid>

      {/* A screener, not a gate — the provider decides, so a BMI under the
          threshold still continues. */}
      {bmi !== null ? (
        <Alert
          tone={meetsCriteria ? 'success' : 'warning'}
          title={`BMI ${bmi}`}
          description={config.criteriaNote}
          action={
            <Badge tone={meetsCriteria ? 'success' : 'warning'}>
              {meetsCriteria ? 'Meets criteria' : 'May not meet criteria'}
            </Badge>
          }
        />
      ) : null}

      <Stack gap="3">
        <h2 className="type-app-heading-m">{config.conditionsPrompt}</h2>
        {/* GAP: Checkbox renders a control and a label, not the comps'
            bordered selectable row, and takes no className — so the row is a
            Card, which is the system's own selected surface. */}
        {config.conditions.map((condition) => (
          <Card key={condition.value} selected={conditions.includes(condition.value)}>
            <CardBody>
              <Checkbox
                checked={conditions.includes(condition.value)}
                onChange={(checked) => toggle(condition.value, checked)}
                label={condition.label}
              />
            </CardBody>
          </Card>
        ))}
      </Stack>

      <Button disabled={bmi === null} onClick={submit}>
        Continue
      </Button>
    </Page>
  );
};
