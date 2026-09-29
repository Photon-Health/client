import { ConditionFlow, StepKey, Treatment } from './types';
import { ella } from './ella';
import { glp1 } from './glp1';

const FLOWS: ConditionFlow[] = [ella, glp1];

export const getConditionFlow = (slug: string | undefined): ConditionFlow | undefined =>
  FLOWS.find((flow) => flow.slug === slug);

const path = (flow: ConditionFlow, segment: string) => `/start/${flow.slug}/${segment}`;

/** 1-based position of a step in this flow, for the meter and the eyebrow. */
export const stepNumber = (flow: ConditionFlow, key: StepKey) => flow.steps.indexOf(key) + 1;

export const pathToStep = (flow: ConditionFlow, key: StepKey) => path(flow, key);

export const pathToFirstStep = (flow: ConditionFlow) => path(flow, flow.steps[0]);

/** Falls through to `submitted` off the last step — nothing else follows it. */
export const pathAfterStep = (flow: ConditionFlow, key: StepKey) => {
  const next = flow.steps[flow.steps.indexOf(key) + 1];
  return next ? path(flow, next) : path(flow, 'submitted');
};

/** Falls back to the landing page, which is what sits before the first step. */
export const pathBeforeStep = (flow: ConditionFlow, key: StepKey) => {
  const index = flow.steps.indexOf(key);
  return index > 0 ? path(flow, flow.steps[index - 1]) : `/start/${flow.slug}`;
};

/** The answers key the medication screen writes, read back at review. */
export const MEDICATION_ANSWER_ID = 'medicationPreference';

/**
 * A medication preference can carry its own drug. "Let my provider recommend"
 * carries none, and so does a flow with no choice screen — both draft the
 * condition's default.
 */
export const resolveTreatment = (
  flow: ConditionFlow,
  answers: Record<string, string>
): Treatment => {
  const chosen = flow.medicationChoice?.options.find(
    (option) => option.value === answers[MEDICATION_ANSWER_ID]
  );
  return chosen?.treatment ?? flow.treatment;
};

export * from './types';
