import { Navigate, useNavigate } from 'react-router-dom';
import { Badge, Button, Card, CardBody, Row, Stack } from '@photon-health/ui';
import { Body, Heading, Muted, Page, Spacer, TopBar } from '../components/Layout';
import { pathAfterStep } from '../conditions';
import { useIntake } from '../state/IntakeContext';

export const WelcomeBack = () => {
  const { flow, patient } = useIntake();
  const navigate = useNavigate();

  if (!patient) {
    return <Navigate to={`/start/${flow.slug}/verify`} replace />;
  }

  const medications = patient.medications;

  return (
    <Page>
      <TopBar />
      <Row>
        <Badge tone="success" dot>
          Verified
        </Badge>
      </Row>
      <Heading>Welcome back{patient.firstName ? `, ${patient.firstName}` : ''}</Heading>
      <Body>
        {medications.length > 0
          ? `We found ${medications.length} medication${
              medications.length === 1 ? '' : 's'
            } on file with Photon. They’re all in one place now.`
          : 'We found your record with Photon. There’s no medication history on file yet.'}
      </Body>

      {medications.length > 0 ? (
        // No CardHeader: the screen keeps one heading, the h1 above.
        <Card>
          <CardBody>
            <Stack gap="3">
              {medications.slice(0, 4).map((medication) => (
                <Stack gap="0" key={medication.id}>
                  <span className="type-app-card-title">{medication.name}</span>
                  <span className="type-app-card-meta text-[var(--text-tertiary)]">
                    {medication.status}
                  </span>
                </Stack>
              ))}
              {medications.length > 4 ? <Muted>{medications.length - 4} more</Muted> : null}
            </Stack>
          </CardBody>
        </Card>
      ) : null}

      <Spacer />
      <Button onClick={() => navigate(pathAfterStep(flow, 'verify'))}>Continue my request</Button>
    </Page>
  );
};
