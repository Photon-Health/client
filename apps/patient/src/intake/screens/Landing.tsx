import { useNavigate } from 'react-router-dom';
import { Button, Card, CardBody, Row, Stack } from '@photon-health/ui';
import { Body, Heading, Muted, Page, SectionLabel, Spacer, TopBar } from '../components/Layout';
import { pathToFirstStep } from '../conditions';
import { useIntake } from '../state/IntakeContext';

export const Landing = () => {
  const { flow } = useIntake();
  const navigate = useNavigate();
  const start = () => navigate(pathToFirstStep(flow));
  const { landing } = flow;

  return (
    <Page>
      <TopBar />
      <p className="intake__eyebrow type-app-small-semibold text-[var(--surface-accent)]">
        {flow.category}
      </p>
      <Heading>{flow.headline}</Heading>
      <Body>{flow.blurb}</Body>

      {/* No CardHeader: the screen keeps one heading, the h1 above. */}
      {flow.stats ? (
        <Card>
          <CardBody>
            <Stack gap="3">
              {flow.stats.map((stat) => (
                <Row gap="4" justify="between" align="start" key={stat.label}>
                  <span className="type-app-body-regular text-[var(--text-tertiary)]">
                    {stat.label}
                  </span>
                  <span className="type-app-body-medium text-right">{stat.value}</span>
                </Row>
              ))}
            </Stack>
          </CardBody>
        </Card>
      ) : null}

      {/* A stats-only landing pins its call to action to the bottom. A page
          with sections below the hero cannot — the button sits in the hero and
          the closing band repeats it. */}
      {landing ? null : <Spacer />}
      <Button onClick={start}>{flow.ctaLabel}</Button>
      <Muted center={!landing}>{flow.footnote}</Muted>

      {landing?.medications ? (
        <Stack gap="3">
          <SectionLabel>{landing.medications.heading}</SectionLabel>
          {landing.medications.items.map((item) => (
            <Card key={item.name}>
              <CardBody>
                <Stack gap="2">
                  <Row gap="4" justify="between" align="start">
                    <span className="type-app-card-title">{item.name}</span>
                    <span className="type-app-small-regular text-[var(--text-tertiary)] text-right">
                      {item.generic}
                    </span>
                  </Row>
                  <Body>{item.detail}</Body>
                </Stack>
              </CardBody>
            </Card>
          ))}
          <Muted>{landing.medications.note}</Muted>
        </Stack>
      ) : null}

      {landing?.howItWorks ? (
        <Stack gap="3">
          <SectionLabel>{landing.howItWorks.heading}</SectionLabel>
          {/* GAP: no numbered-list component, and an <ol> marker cannot be
              given the comps' zero-padded, tertiary-coloured ordinal. */}
          <Stack gap="2" as="ul">
            {landing.howItWorks.steps.map((step, index) => (
              // GAP: Row takes no `as="li"`, so the list item is a Stack.
              <Stack as="li" key={step}>
                <Row gap="3" align="center">
                  <span className="intake__ordinal type-app-small-regular text-[var(--text-tertiary)]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="type-app-heading-m">{step}</span>
                </Row>
              </Stack>
            ))}
          </Stack>
        </Stack>
      ) : null}

      {landing?.pricing ? (
        <Stack gap="3">
          <SectionLabel>{landing.pricing.heading}</SectionLabel>
          <Row gap="4" justify="between" align="center">
            <span className="type-app-body-regular text-[var(--text-secondary)]">
              {landing.pricing.label}
            </span>
            <span className="type-app-heading-l">{landing.pricing.value}</span>
          </Row>
          <Muted>{landing.pricing.note}</Muted>
        </Stack>
      ) : null}

      {landing?.closing ? (
        // GAP: the comps' closing band is a dark brand surface. tokens.css has
        // no colour utility for one and the app is not on Tailwind, so the
        // sunken card is the nearest surface the system actually ships.
        <Card variant="sunken">
          <CardBody>
            <Stack gap="4">
              <Heading as="h2">{landing.closing.headline}</Heading>
              <Button onClick={start}>{landing.closing.ctaLabel}</Button>
            </Stack>
          </CardBody>
        </Card>
      ) : null}
    </Page>
  );
};
