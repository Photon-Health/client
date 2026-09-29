import { ReactNode } from 'react';
import { Button, Container, Row, Stack } from '@photon-health/ui';
import { StepKey, stepNumber } from '../conditions';
import { useIntake } from '../state/IntakeContext';

export const Page = ({ children }: { children: ReactNode }) => (
  <div className="intake">
    <Container as="main" size="sm" className="intake__container">
      <Stack gap="5" className="intake__column">
        {children}
      </Stack>
    </Container>
  </div>
);

export const TopBar = ({ onBack, right }: { onBack?: () => void; right?: ReactNode }) => (
  <Row justify="between" wrap={false}>
    {onBack ? (
      <Button variant="ghost" size="sm" onClick={onBack}>
        ← Back
      </Button>
    ) : (
      <span className="intake__eyebrow type-app-small-semibold">PHOTON</span>
    )}
    {right}
  </Row>
);

/**
 * Length and position both come from the flow's own step spine, so a
 * condition with six steps meters six without a screen knowing the count.
 */
export const Progress = ({ step }: { step: StepKey }) => {
  const { flow } = useIntake();
  const current = stepNumber(flow, step);

  return (
    <div className="intake__progress" role="presentation">
      {flow.steps.map((key, index) => (
        <span key={key} data-on={index < current} />
      ))}
    </div>
  );
};

/** Case, tracking and the mono face all come from `.intake__eyebrow`. */
export const StepLabel = ({ step, label }: { step: StepKey; label: string }) => {
  const { flow } = useIntake();

  return (
    <p className="intake__eyebrow type-app-small-semibold text-[var(--text-tertiary)]">
      Step {stepNumber(flow, step)} of {flow.steps.length} · {label}
    </p>
  );
};

/** Eyebrow over a landing section. An h2 so the marketing page keeps an outline. */
export const SectionLabel = ({ children }: { children: ReactNode }) => (
  <h2 className="intake__eyebrow type-app-small-semibold text-[var(--surface-accent)]">
    {children}
  </h2>
);

/**
 * `as` exists only for a screen that stacks several headings at comp size —
 * the first is the page heading, the rest are sections under it.
 */
export const Heading = ({
  as: Tag = 'h1',
  children
}: {
  as?: 'h1' | 'h2';
  children: ReactNode;
}) => <Tag className="type-app-heading-xl">{children}</Tag>;

export const Body = ({ children }: { children: ReactNode }) => (
  <p className="type-app-body-regular text-[var(--text-secondary)]">{children}</p>
);

export const Muted = ({ center, children }: { center?: boolean; children: ReactNode }) => (
  <p
    className={`type-app-small-regular text-[var(--text-tertiary)]${center ? ' text-center' : ''}`}
  >
    {children}
  </p>
);

export const Spacer = () => <div className="intake__spacer" />;
