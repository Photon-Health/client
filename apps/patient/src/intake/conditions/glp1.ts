import { ConditionFlow } from './types';

/**
 * Clinical copy, the review fee and both NDCs are still placeholders pending
 * sign-off. Filling them in is a config edit — see intake/README.md.
 */
export const glp1: ConditionFlow = {
  slug: 'glp1',
  category: 'Weight management',
  headline: 'GLP-1 care from a licensed provider, filled at your pharmacy',
  blurb:
    'See if Wegovy or Zepbound could be right for you. Check eligibility in 2 minutes, and we’ll help you understand your coverage.',
  ctaLabel: 'Check if I’m eligible',
  footnote: 'US-licensed providers · Insurance or self-pay · Ongoing care',
  landing: {
    medications: {
      heading: 'Medications',
      items: [
        {
          name: 'Wegovy',
          generic: 'semaglutide',
          detail: 'Weekly injection. Dose steps up over about 4 months.'
        },
        {
          name: 'Zepbound',
          generic: 'tirzepatide',
          detail: 'Weekly injection. Dose steps up every 4 weeks.'
        }
      ],
      note: 'Your provider may recommend a different option based on your health history.'
    },
    howItWorks: {
      heading: 'How it works',
      steps: [
        'Check eligibility',
        'Health history and labs',
        'Coverage check',
        'Provider review',
        'Ongoing care and refills'
      ]
    },
    pricing: {
      heading: 'Pricing',
      label: 'Provider review',
      // PLACEHOLDER — the review fee is not set.
      value: '$XX',
      note: 'Medication cost depends on your insurance or self-pay program. We’ll show your estimate before you submit.'
    },
    closing: {
      headline: 'Find out if you’re eligible in 2 minutes',
      ctaLabel: 'Check if I’m eligible'
    }
  },
  steps: ['eligibility', 'questions', 'verify', 'medication', 'review', 'pharmacy'],
  eligibility: {
    headline: 'Let’s check if GLP-1 treatment could fit',
    bmiThreshold: 30,
    bmiThresholdWithCondition: 27,
    criteriaNote:
      'GLP-1 medications are approved for a BMI of 30 or more, or 27 or more with a weight-related condition.',
    conditionsPrompt: 'Do any of these apply to you?',
    conditions: [
      { value: 'hypertension', label: 'High blood pressure' },
      { value: 'type2Diabetes', label: 'Type 2 diabetes' },
      { value: 'sleepApnea', label: 'Sleep apnea' }
    ]
  },
  questionsHeading: 'A few safety questions',
  questions: [
    {
      id: 'thyroidCancer',
      prompt: 'Have you or a family member had medullary thyroid cancer or MEN2?',
      horizontal: true,
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' }
      ]
    },
    {
      id: 'pancreatitis',
      prompt: 'Have you ever had pancreatitis?',
      horizontal: true,
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' }
      ]
    },
    {
      id: 'pregnancy',
      prompt: 'Are you pregnant, breastfeeding, or planning to become pregnant?',
      horizontal: true,
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' }
      ]
    },
    {
      id: 'insulinOrSulfonylurea',
      prompt: 'Do you take insulin or a sulfonylurea (e.g. glipizide)?',
      horizontal: true,
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' }
      ]
    }
  ],
  medicationChoice: {
    headline: 'Do you have a medication in mind?',
    options: [
      {
        value: 'zepbound',
        label: 'Zepbound (tirzepatide)',
        detail: 'Weekly injection · pens or vials',
        treatment: {
          ndc: '00169-4572-01',
          name: 'tirzepatide',
          displayName: 'Zepbound (tirzepatide) starting dose',
          instructions: 'Inject under the skin once weekly',
          quantity: 4,
          unit: 'pen',
          refillsAllowed: 0
        }
      },
      {
        value: 'wegovy',
        label: 'Wegovy (semaglutide)',
        detail: 'Weekly injection · pens',
        treatment: {
          ndc: '00169-4572-01',
          name: 'semaglutide',
          displayName: 'Wegovy (semaglutide) starting dose',
          instructions: 'Inject under the skin once weekly',
          quantity: 4,
          unit: 'pen',
          refillsAllowed: 0
        }
      },
      {
        value: 'provider',
        label: 'Let my provider recommend',
        detail: 'Based on your history and coverage'
      }
    ],
    noteTitle: 'This is a preference, not a decision',
    noteBody:
      'Your provider will choose the medication and starting dose. Coverage can also affect which one makes sense.'
  },
  /** Drafted when no preference carries its own drug — see `resolveTreatment`. */
  treatment: {
    ndc: '00169-4572-01',
    name: 'semaglutide',
    displayName: 'GLP-1 starting dose — provider’s choice',
    instructions: 'Inject under the skin once weekly',
    quantity: 4,
    unit: 'pen',
    refillsAllowed: 0
  }
};
