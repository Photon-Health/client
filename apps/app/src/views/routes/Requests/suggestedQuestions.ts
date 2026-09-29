import { PatientQuestion } from './requests';

type SuggestedQuestion = PatientQuestion & { key: string };

const confirmWeight: SuggestedQuestion = {
  key: 'weight',
  text: 'Confirm your weight',
  reason: 'Some medications work differently at higher body weights, so I want to be sure of yours.'
};

const byMedication: Array<{ matches: RegExp; questions: SuggestedQuestion[] }> = [
  {
    matches: /ella|ulipristal/i,
    questions: [
      {
        key: 'breastfeeding',
        text: 'Are you currently breastfeeding?',
        reason:
          'ella can pass into breast milk. Your answer helps me decide whether to approve or suggest an alternative.'
      },
      confirmWeight,
      {
        key: 'last_period',
        text: 'When was your last period?',
        reason: 'This helps me confirm ella is right for where you are in your cycle.'
      }
    ]
  }
];

const general: SuggestedQuestion[] = [
  {
    key: 'current_medications',
    text: 'Are you taking any other medications?',
    reason: 'I want to check for interactions before approving.'
  },
  {
    key: 'allergies',
    text: 'Do you have any allergies to medications?',
    reason: 'I want to make sure this prescription is safe for you.'
  }
];

/** Common follow-ups for the requested medication, falling back to general ones. */
export const suggestedQuestions = (medication: string): SuggestedQuestion[] =>
  byMedication.find(({ matches }) => matches.test(medication))?.questions ?? general;
