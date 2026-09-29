import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@photon-health/ui';
import { Body, Heading, Muted, Page, Spacer, TopBar } from '../components/Layout';
import { useIntake } from '../state/IntakeContext';

type UnresolvedState = { reason?: string };

/**
 * Dead-end for an ambiguous match only — a no-match now goes to the new-profile
 * screen. Ambiguous deliberately does not: creating a second record for someone
 * who probably already has one is worse than stopping, and the duplicate would
 * split their medication history across two patient rows.
 */
export const Unresolved = () => {
  const { flow } = useIntake();
  const navigate = useNavigate();
  const { reason } = (useLocation().state ?? {}) as UnresolvedState;

  return (
    <Page>
      <TopBar onBack={() => navigate(`/start/${flow.slug}/verify`)} />
      <Heading>We need a bit more to identify you</Heading>
      <Body>
        More than one Photon record matched those details, so we stopped rather than guess.
      </Body>
      {reason ? <Muted>{reason}</Muted> : null}
      <Body>Double-check your last name and date of birth, then try again.</Body>

      <Spacer />
      <Button onClick={() => navigate(`/start/${flow.slug}/verify`)}>Try again</Button>
    </Page>
  );
};
