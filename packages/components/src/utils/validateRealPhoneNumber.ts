import parsePhoneNumber from 'libphonenumber-js';

/**
 * Check that number is a real, callable phone number
 */
export const validateRealPhoneNumber = (number: string) => {
  const parsedNumber = parsePhoneNumber(number, 'US');
  return parsedNumber?.isValid() || false;
};
