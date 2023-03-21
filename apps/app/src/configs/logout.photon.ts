import { LogoutSettings } from '../models/general';

export const logoutSettings: LogoutSettings = {
  default: {
    returnTo: window.location.origin,
    federated: false
  },
  // Peachy
  [process.env.REACT_APP_PEACHY_ORG_ID as string]: {
    returnTo: window.location.origin,
    federated: true
  }
};
