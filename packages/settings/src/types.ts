/**
 * Organization settings
 *
 * @param logo Primary logo
 * @param accentColor Primary theme color
 * @param sendOrder Toggle ability to create new orders
 * @param courier Toggle fulfillment courier pharmacy options
 * @param courierProviders Fulfillment courier pharmacy options
 * @param pickUp Toggle fulfillment pickup pharmacy options
 * @param mailOrder Toggle fulfillment mail order pharmacy options
 * @param mailOrderProviders Fulfillment mail order pharmacy options
 * @param sendToPatient Toggle ability to send to patient for pharmacy selection
 * @param sendToPatientUsers Limit ability to send to patient to specific users
 * @param returnTo Logout redirect
 * @param federated Toggle federated auth
 *
 */

export type OrganizationSettings = {
  logo?: string | undefined;
  accentColor?: string;
  sendOrder?: boolean;
  courier?: boolean;
  courierProviders?: string[];
  pickUp?: boolean;
  mailOrder?: boolean;
  mailOrderProviders?: string[];
  sendToPatient?: boolean;
  sendToPatientUsers?: string[];
  returnTo?: string;
  federated?: boolean;
};
