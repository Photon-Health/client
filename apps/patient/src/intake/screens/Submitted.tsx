import { Badge, Card, CardBody, CardHeader, Stack } from '@photon-health/ui';
import { Heading, Muted, Page, TopBar } from '../components/Layout';
import { useIntake } from '../state/IntakeContext';

const STAGES = ['Submitted', 'In review', 'Approved', 'Sent to pharmacy'];

export const Submitted = () => {
  const { flow, patient, pharmacyName } = useIntake();

  return (
    <Page>
      <TopBar
        right={
          patient?.firstName ? (
            <span className="type-app-body-medium">{patient.firstName}</span>
          ) : undefined
        }
      />
      <Heading>Your request</Heading>

      <p className="intake__eyebrow type-app-small-semibold text-[var(--text-tertiary)]">
        In progress
      </p>
      <Card>
        <CardHeader
          title={flow.treatment.displayName}
          description={pharmacyName}
          action={
            <Badge tone="info" dot>
              In review
            </Badge>
          }
        />
        <CardBody>
          {/* GAP: no timeline or stepper component in the design system. Row
              takes no data-* passthrough, so these are plain elements. */}
          <Stack gap="3">
            {STAGES.map((stage, index) => (
              <div key={stage} className="intake__timeline-step" data-current={index === 0}>
                <span className="intake__timeline-dot" />
                <span className="type-app-body-regular">{stage}</span>
              </div>
            ))}
          </Stack>
        </CardBody>
      </Card>

      <Muted>
        This request is a draft until a provider reviews it. Status here is not saved — refreshing
        starts over.
      </Muted>
    </Page>
  );
};
