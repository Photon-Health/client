import { describe, expect, test } from 'vitest';

import { PhotonPpDraftOrderOutcomeStatus } from '../../../network-api/gql/graphql';
import {
  ageFromDateOfBirth,
  describeRequest,
  followUpQuestions,
  formatAnswer,
  formatSubmitted,
  intakeQuestions,
  requestStatus
} from './requests';
import { makeDraft } from './testFixtures';

const claim = {
  __typename: 'PhotonPpDraftOrderClaim' as const,
  organizationId: 'org_mine',
  claimedAt: '2026-09-29T10:00:00.000Z',
  waitingForPatient: false,
  patientId: 'pat_mine',
  claimedByUserId: 'auth0|me',
  claimedByMe: true
};

describe('describeRequest', () => {
  test('summarizes the patient, medication, and the intake reason and urgency', () => {
    expect(describeRequest(makeDraft())).toEqual(
      expect.objectContaining({
        id: 'ordd_test',
        patientName: 'Achilles R.',
        state: 'CO',
        medication: 'ella 30 mg',
        reason: 'Emergency contraception',
        urgency: '52 h left in window'
      })
    );
  });
});

describe('intake and follow-up questions', () => {
  test('keeps reason and urgency out of the intake answers', () => {
    expect(intakeQuestions(makeDraft()).map((q) => q.key)).toEqual([
      'time_since_unprotected_sex',
      'breastfeeding'
    ]);
  });

  test('treats questions from the claiming organization as follow-ups', () => {
    const draft = makeDraft({ claim });
    const followUp = {
      ...draft.order.questions[3],
      id: 'ordq_mine',
      authorOrganizationId: 'org_mine'
    };
    const withFollowUp = makeDraft({
      claim,
      order: { ...draft.order, questions: [...draft.order.questions, followUp] }
    });

    expect(followUpQuestions(withFollowUp).map((q) => q.id)).toEqual(['ordq_mine']);
    expect(intakeQuestions(withFollowUp).map((q) => q.id)).not.toContain('ordq_mine');
  });
});

describe('requestStatus', () => {
  test.each([
    [makeDraft(), 'Unclaimed'],
    [makeDraft({ claim }), 'Claimed by you'],
    [makeDraft({ claim: { ...claim, claimedByMe: false } }), 'Claimed by a colleague'],
    [makeDraft({ claim: { ...claim, waitingForPatient: true } }), 'Waiting on patient'],
    [
      makeDraft({
        claim,
        outcome: {
          __typename: 'PhotonPpDraftOrderOutcome',
          status: PhotonPpDraftOrderOutcomeStatus.Rejected,
          closedAt: '2026-09-29T11:00:00.000Z',
          orderId: null,
          rejectionReason: 'No'
        }
      }),
      'Declined'
    ]
  ])('labels the request', (draft, label) => {
    expect(requestStatus(draft).label).toBe(label);
  });
});

describe('formatting', () => {
  test('formats each kind of answer', () => {
    const base = {
      __typename: 'OrderQuestionAnswer' as const,
      text: null,
      boolean: null,
      date: null,
      choices: null
    };
    expect(formatAnswer({ ...base, boolean: false })).toBe('No');
    expect(formatAnswer({ ...base, date: '2026-09-01' })).toBe('2026-09-01');
    expect(formatAnswer({ ...base, choices: ['a', 'b'] })).toBe('a, b');
    expect(formatAnswer(null)).toBeUndefined();
  });

  test('describes how long ago a request was submitted', () => {
    const now = new Date('2026-09-29T12:00:00.000Z');
    expect(formatSubmitted('2026-09-29T11:48:00.000Z', now)).toBe('12 min ago');
    expect(formatSubmitted('2026-09-29T09:00:00.000Z', now)).toBe('3 h ago');
    expect(formatSubmitted('2026-09-27T12:00:00.000Z', now)).toBe('2 d ago');
  });

  test('computes age from a date of birth, in UTC', () => {
    expect(ageFromDateOfBirth('1997-04-12', new Date('2026-04-11T12:00:00Z'))).toBe(28);
    expect(ageFromDateOfBirth('1997-04-12', new Date('2026-04-12T12:00:00Z'))).toBe(29);
  });
});
