import { useNavigate } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  RadioGroup,
  Row,
  Stack,
  Tag
} from '@photon-health/ui';
import { Heading, Muted, Page, Progress, StepLabel, TopBar } from '../components/Layout';
import { pathAfterStep } from '../conditions';
import { useIntake } from '../state/IntakeContext';

export const HealthHistory = () => {
  const { flow, patient, answers, setAnswer } = useIntake();
  const navigate = useNavigate();

  const answered = flow.questions.every((question) => Boolean(answers[question.id]));
  // Empty until the patient is identified, which some flows do after this step.
  const currentMedications = (patient?.medications ?? []).filter(
    (medication) => medication.status !== 'INACTIVE'
  );

  return (
    <Page>
      <TopBar onBack={() => navigate(-1)} />
      <Progress step="questions" />
      <StepLabel step="questions" label="Health history" />

      {/* GAP: without a page heading the prompt is the heading, per the comps,
          so it cannot also be RadioGroup's label — and RadioGroup has no
          aria-labelledby, no visually-hidden label, and no className to apply
          .sr-only, so the group goes unnamed for assistive tech. A flow that
          sets `questionsHeading` gets the heading back and each prompt names
          its own group properly. */}
      {flow.questionsHeading ? <Heading>{flow.questionsHeading}</Heading> : null}

      {flow.questions.map((question, index) => (
        <Stack gap="4" key={question.id}>
          {flow.questionsHeading ? null : (
            <Heading as={index === 0 ? 'h1' : 'h2'}>{question.prompt}</Heading>
          )}
          <RadioGroup
            label={flow.questionsHeading ? question.prompt : undefined}
            horizontal={question.horizontal}
            options={question.options}
            value={answers[question.id] ?? null}
            onChange={(value) => setAnswer(question.id, value)}
          />
        </Stack>
      ))}

      {currentMedications.length > 0 ? (
        <Card>
          <CardHeader
            title="Current medications"
            action={<Badge tone="info">From your Photon history</Badge>}
          />
          <CardBody>
            <Stack gap="3">
              <Row gap="2">
                {currentMedications.map((medication) => (
                  <Tag tone="relationship" key={medication.id}>
                    {medication.name}
                  </Tag>
                ))}
              </Row>
              {/* Static for now — tappable tags are deferred. */}
              <Muted>Still taking these? Tap to remove or add others.</Muted>
            </Stack>
          </CardBody>
        </Card>
      ) : null}

      <Button disabled={!answered} onClick={() => navigate(pathAfterStep(flow, 'questions'))}>
        {flow.questionsHeading ? 'Continue' : 'Next'}
      </Button>
    </Page>
  );
};
