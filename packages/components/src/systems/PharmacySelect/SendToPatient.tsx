import { createMemo } from 'solid-js';
import Badge, { BadgeColor } from '../../particles/Badge';
import Card from '../../particles/Card';
import Text from '../../particles/Text';

type STPState = {
  badgeColor: BadgeColor;
  badgeText: string;
  text: string;
};

const stpStates: {
  [key: string]: STPState;
} = {
  patientWillSelect: {
    badgeColor: 'blue',
    badgeText: 'Patient Will Select',
    text: 'Patient will select a pharmacy after you send an order.'
  },
  recentPharmacy: {
    badgeColor: 'blue',
    badgeText: 'Recent Pharmacy',
    text: 'This patient selected this pharmacy in the last 8 hours. After you send this order, the patient can change the pharmacy.'
  },
  preferredPharmacy: {
    badgeColor: 'blue',
    badgeText: 'Preferred Pharmacy',
    text: 'This patient selected this as their preferred pharmacy.'
  }
};

export function SendToPatient() {
  const state = createMemo(() => stpStates.patientWillSelect);
  return (
    <>
      <Badge color={state().badgeColor}>{state().badgeText}</Badge>
      <Text size="sm" class="py-4">
        {state().text}
      </Text>

      <Card gray>Hello</Card>
    </>
  );
}
