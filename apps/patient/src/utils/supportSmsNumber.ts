export const getSupportSmsNumber = (enableAutomatedOps?: boolean | null): string => {
  const automatedOpsSmsNumber = import.meta.env.VITE_AUTOMATED_OPS_SMS_NUMBER;
  // Local .env files pulled before this variable existed lack it; keep the button working.
  if (enableAutomatedOps && automatedOpsSmsNumber) {
    return automatedOpsSmsNumber;
  }
  return import.meta.env.VITE_TWILIO_SMS_NUMBER;
};
