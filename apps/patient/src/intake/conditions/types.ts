export type StatRow = { label: string; value: string };

export type QuestionOption = { value: string; label: string };

export type Question = {
  id: string;
  prompt: string;
  options: QuestionOption[];
  /** Lay the options out side by side. For two short options — Yes / No. */
  horizontal?: boolean;
};

export type Treatment = {
  /** Exact catalog reference — preferred over `name`, which can go ambiguous. */
  ndc?: string;
  /**
   * Fallback free text. MediSpan requires every word to appear in the drug
   * name ("Ulipristal Acetate Oral Tablet 30 MG"), so keep it to the
   * ingredient — strength/form wording drops the match to zero results.
   */
  name: string;
  displayName: string;
  instructions: string;
  quantity: number;
  unit: string;
  refillsAllowed: number;
};

/**
 * The ordered spine of a flow. A screen asks the flow where it sits rather
 * than hardcoding "step 2 of 4", so a condition can drop a step, add one, or
 * reorder without touching a screen. Each key is also the route segment.
 */
export type StepKey = 'eligibility' | 'verify' | 'questions' | 'medication' | 'review' | 'pharmacy';

export type EligibilityConfig = {
  headline: string;
  /** BMI at or above this qualifies on its own. */
  bmiThreshold: number;
  /** BMI at or above this qualifies alongside a weight-related condition. */
  bmiThresholdWithCondition: number;
  criteriaNote: string;
  conditionsPrompt: string;
  conditions: QuestionOption[];
};

export type MedicationChoice = {
  value: string;
  label: string;
  /** Secondary line — form and frequency. */
  detail: string;
  /** Drafts this instead of `flow.treatment` when chosen. */
  treatment?: Treatment;
};

export type MedicationChoiceConfig = {
  headline: string;
  options: MedicationChoice[];
  noteTitle: string;
  noteBody: string;
};

/**
 * Marketing sections under the landing hero. A condition that sells itself on
 * a stats table (ella) sets `stats` and leaves this off.
 */
export type LandingContent = {
  medications?: {
    heading: string;
    items: { name: string; generic: string; detail: string }[];
    note: string;
  };
  howItWorks?: { heading: string; steps: string[] };
  pricing?: { heading: string; label: string; value: string; note: string };
  closing?: { headline: string; ctaLabel: string };
};

export type ConditionFlow = {
  slug: string;
  /** Eyebrow above the landing headline, e.g. "EMERGENCY CONTRACEPTION". */
  category: string;
  headline: string;
  blurb: string;
  stats?: StatRow[];
  landing?: LandingContent;
  ctaLabel: string;
  footnote: string;
  steps: StepKey[];
  eligibility?: EligibilityConfig;
  /** Renders as the page heading, with each prompt naming its own option set. */
  questionsHeading?: string;
  questions: Question[];
  medicationChoice?: MedicationChoiceConfig;
  treatment: Treatment;
};
