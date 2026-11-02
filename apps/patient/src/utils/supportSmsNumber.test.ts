import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { getSupportSmsNumber } from './supportSmsNumber';

const DEFAULT_SUPPORT_SMS_NUMBER = '5138663212';
const AUTOMATED_OPS_SUPPORT_SMS_NUMBER = '3158608762';

describe('getSupportSmsNumber', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_TWILIO_SMS_NUMBER', DEFAULT_SUPPORT_SMS_NUMBER);
    vi.stubEnv('VITE_AUTOMATED_OPS_SMS_NUMBER', AUTOMATED_OPS_SUPPORT_SMS_NUMBER);
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

  test('falls back to the default support number when the automated ops number is not set', () => {
    vi.stubEnv('VITE_AUTOMATED_OPS_SMS_NUMBER', '');
    expect(getSupportSmsNumber(true)).toBe(DEFAULT_SUPPORT_SMS_NUMBER);
  });
});
