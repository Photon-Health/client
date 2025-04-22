/**
 * Organization settings
 * @deprecated Use MailOrderPharmacyConfigs and server side organization settings instead
 *
 * @param logo Primary logo
 * @param accentColor Primary theme color
 * @param sendOrder Toggle ability to create new orders
 * @param enableCourierNavigate Toggle courier fulfillment pharmacy options in the Navigate app
 * @param pickUp Toggle fulfillment pickup pharmacy options
 * @param mailOrder Toggle fulfillment mail order pharmacy options
 * @param mailOrderProviders Fulfillment mail order pharmacy options
 * @param mailOrderNavigate Toggle fulfillment mail order pharmacy options for Navigate
 * @param mailOrderNavigateProviders Fulfillment mail order pharmacy options for Navigate
 * @param sendToPatient Toggle ability to send to patient for pharmacy selection
 * @param sendToPatientUsers Limit ability to send to patient to specific users
 * @param returnTo Logout redirect
 * @param federated Toggle federated auth
 * @param enablePatientRerouting Ability for patients to reroute orders
 * @param enableMedHistory Show the med history section in the prescribe flow
 * @param enableRxAndOrder Combine Rx and order creation into one prescribe flow
 * @param enableCombineAndDuplicate Enable the ability to combine and duplicate orders
 * @param enablePricing Enable prices to show in the patient app
 * @param topRankedCostco Enable Costco to rank at the top of pickup pharmacy list in the patient app
 * @param topRankedWalgreens Enable Walgreens to rank at the top of pickup pharmacy list in the patient app
 * @param paExceptionMessage Enable organizations to customize their PA Exception copy
 *
 */
export type OrganizationSettings = {
  logo?: string | undefined;
  accentColor?: string;
  sendOrder?: boolean;
  enableCourierNavigate?: boolean;
  pickUp?: boolean;
  mailOrder?: boolean;
  mailOrderProviders?: string[];
  mailOrderNavigate?: boolean;
  mailOrderNavigateProviders?: string[];
  sendToPatient?: boolean;
  sendToPatientUsers?: string[];
  enablePatientRerouting?: boolean;
  returnTo?: string;
  federated?: boolean;
  enableMedHistory?: boolean;
  enableRxAndOrder?: boolean;
  enableCombineAndDuplicate?: boolean;
  enablePricing?: boolean;
  topRankedCostco?: boolean;
  topRankedWalgreens?: boolean;
  hideTemplates?: boolean;
  paExceptionMessage?: string;
};

export interface MailOrderPharmacyConfigs {
  provider: string[];
  patient: string[];
}
