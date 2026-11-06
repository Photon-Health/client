export const AUTOMATED_OPS_SUPPORT_SMS_NUMBER = '3158608762';

export const getSupportSmsNumber = (enableAutomatedOps?: boolean | null): string =>
  enableAutomatedOps ? AUTOMATED_OPS_SUPPORT_SMS_NUMBER : import.meta.env.VITE_TWILIO_SMS_NUMBER;
