const AUTOROUTED_PHARMACY_CONFIRMED_KEY_PREFIX = 'patientAutoroutedPharmacyConfirmed';

const getStorageKey = (orderId: string) => `${AUTOROUTED_PHARMACY_CONFIRMED_KEY_PREFIX}:${orderId}`;

export const hasConfirmedAutoroutedPharmacy = (orderId: string): boolean => {
  try {
    return localStorage.getItem(getStorageKey(orderId)) === 'true';
  } catch {
    return false;
  }
};

export const markAutoroutedPharmacyConfirmed = (orderId: string): void => {
  try {
    localStorage.setItem(getStorageKey(orderId), 'true');
  } catch {
    // localStorage may be unavailable in private browsing or restricted contexts
  }
};

export const clearAutoroutedPharmacyConfirmation = (orderId: string): void => {
  try {
    localStorage.removeItem(getStorageKey(orderId));
  } catch {
    // localStorage may be unavailable in private browsing or restricted contexts
  }
};
