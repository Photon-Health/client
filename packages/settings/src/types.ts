/**
 * Organization settings
 *
 * @param logo Primary logo
 * @param accentColor Primary theme color
 * @param sendOrder Toggle ability to create new orders
 * @param enableCourierNavigate Toggle courier fulfillment pharmacy options in the Navigate app
 * @param courierNavigateProviders List of courier pharmacy options
 * @param pickUp Toggle fulfillment pickup pharmacy options
 * @param mailOrder Toggle fulfillment mail order pharmacy options
 * @param mailOrderProviders Fulfillment mail order pharmacy options
 * @param mailOrderNavigate Toggle fulfillment mail order pharmacy options for Navigate
 * @param mailOrderNavigateProviders Fulfillment mail order pharmacy options for Navigate
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
  enableCourierNavigate?: boolean;
  courierNavigateProviders?: string[];
  pickUp?: boolean;
  mailOrder?: boolean;
  mailOrderProviders?: string[];
  mailOrderNavigate?: boolean;
  mailOrderNavigateProviders?: string[];
  sendToPatient?: boolean;
  sendToPatientUsers?: string[];
  patientsCanReroute: boolean;
  returnTo?: string;
  federated?: boolean;
  // Show the med history section in the prescribe flow
  enableMedHistory?: boolean;
  // Combine Rx and order creation into one prescribe flow
  enableRxAndOrder?: boolean;
};
