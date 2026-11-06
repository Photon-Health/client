import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { AUTOMATED_OPS_SUPPORT_SMS_NUMBER, getSupportSmsNumber } from './supportSmsNumber';

const DEFAULT_SUPPORT_SMS_NUMBER = '5138663212';

describe('getSupportSmsNumber', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_TWILIO_SMS_NUMBER', DEFAULT_SUPPORT_SMS_NUMBER);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test('returns the automated ops number when automated ops is enabled', () => {
    expect(getSupportSmsNumber(true)).toBe(AUTOMATED_OPS_SUPPORT_SMS_NUMBER);
  });

  test.each([false, null, undefined])(
    'returns the default support number when automated ops is %s',
    (enableAutomatedOps) => {
      expect(getSupportSmsNumber(enableAutomatedOps)).toBe(DEFAULT_SUPPORT_SMS_NUMBER);
    }
  );
});
