import { LogoutSettings } from '../models/general';

export const logoutSettings: LogoutSettings = {
  default: {
    returnTo: window.location.origin,
    federated: false
  }
};
