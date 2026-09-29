import { ConditionFlow } from './types';

export const ella: ConditionFlow = {
  slug: 'ella',
  category: 'Emergency contraception',
  headline: 'Get ella prescribed online, reviewed by a licensed provider',
  blurb:
    'ella (ulipristal acetate) works up to 5 days after unprotected sex. Answer a few questions and a provider will review your request.',
  stats: [
    { label: 'Works within', value: 'Up to 120 hours' },
    { label: 'Typical review time', value: 'Under 1 hour' },
    { label: 'Review fee · charged only if approved', value: '$15' },
    { label: 'Pickup', value: 'Most local pharmacies' }
  ],
  ctaLabel: 'Start my request',
  footnote: 'Takes about 3 minutes. Already used Photon? We’ll find your history after you verify.',
  steps: ['verify', 'questions', 'review', 'pharmacy'],
  questions: [
    {
      id: 'timeSinceEvent',
      prompt: 'When did unprotected sex happen?',
      options: [
        { value: 'lt24h', label: 'In the last 24 hours' },
        { value: '1to3d', label: '1–3 days ago' },
        { value: '3to5d', label: '3–5 days ago' },
        { value: 'gt5d', label: 'More than 5 days ago' }
      ]
    },
    {
      id: 'currentlyPregnant',
      prompt: 'Is there any chance you are currently pregnant?',
      options: [
        { value: 'no', label: 'No' },
        { value: 'unsure', label: 'I’m not sure' },
        { value: 'yes', label: 'Yes' }
      ]
    }
  ],
  treatment: {
    ndc: '73302-0456-01',
    name: 'ulipristal acetate',
    displayName: 'ella (ulipristal acetate) 30 mg',
    instructions: 'Take 1 tablet by mouth as soon as possible',
    quantity: 1,
    unit: 'tablet',
    refillsAllowed: 0
  }
};
