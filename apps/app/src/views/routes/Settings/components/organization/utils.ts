import { Env } from '@photonhealth/sdk';
import { OrganizationSettings } from 'apps/app/src/gql/graphql';
import { clinicalApiUrl } from 'packages/sdk/src/utils';
import * as yup from 'yup';

export const organizationSettingsFormSchema = yup.object({
  brandColor: yup
    .string()
    .matches(/^#([0-9a-fA-F]{6})$/, 'Invalid color')
    .required('Brand color is required'),
  brandLogo: yup.string().url('Invalid logo URL'),
  supportContactAdmin: yup.boolean().required('Please select true or false'),
  supportName: yup.string().when('supportContactAdmin', {
    is: false,
    then: (schema) => schema.required('Support contact name is required')
  }),
  supportEmail: yup.string().when('supportContactAdmin', {
    is: false,
    then: (schema) => schema.required('Support contact email is required').email('Invalid email')
  }),
  enableRxClarificationSupport: yup.boolean().required('Please select true or false'),
  rxClarificationContactProvider: yup.boolean().required('Please select true or false'),
  rxClarificationContactAdmin: yup.boolean().required('Please select true or false'),
  rxClarificationName: yup
    .string()
    .when(
      [
        'enableRxClarificationSupport',
        'rxClarificationContactProvider',
        'rxClarificationContactAdmin'
      ],
      {
        is: (
          enableRxClarificationSupport: boolean,
          rxClarificationContactProvider: boolean,
          rxClarificationContactAdmin: boolean
        ) =>
          enableRxClarificationSupport &&
          !rxClarificationContactProvider &&
          !rxClarificationContactAdmin,
        then: (schema) => schema.required('Rx clarification contact name is required').min(1)
      }
    ),
  rxClarificationEmail: yup
    .string()
    .when(
      [
        'enableRxClarificationSupport',
        'rxClarificationContactProvider',
        'rxClarificationContactAdmin'
      ],
      {
        is: (
          enableRxClarificationSupport: boolean,
          rxClarificationContactProvider: boolean,
          rxClarificationContactAdmin: boolean
        ) =>
          enableRxClarificationSupport &&
          !rxClarificationContactProvider &&
          !rxClarificationContactAdmin,
        then: (schema) =>
          schema.required('Rx clarification contact email is required').email('Invalid email')
      }
    ),
  enablePriorAuthorizationSupport: yup.boolean().required('Please select true or false'),
  priorAuthorizationContactProvider: yup.boolean().required('Please select true or false'),
  priorAuthorizationContactAdmin: yup.boolean().required('Please select true or false'),
  priorAuthorizationName: yup
    .string()
    .when(
      [
        'enablePriorAuthorizationSupport',
        'priorAuthorizationContactProvider',
        'priorAuthorizationContactAdmin'
      ],
      {
        is: (
          enablePriorAuthorizationSupport: boolean,
          priorAuthorizationContactProvider: boolean,
          priorAuthorizationContactAdmin: boolean
        ) =>
          enablePriorAuthorizationSupport &&
          !priorAuthorizationContactProvider &&
          !priorAuthorizationContactAdmin,
        then: (schema) => schema.required('Prior authorization name is required').min(1)
      }
    ),
  priorAuthorizationEmail: yup
    .string()
    .when(
      [
        'enablePriorAuthorizationSupport',
        'priorAuthorizationContactProvider',
        'priorAuthorizationContactAdmin'
      ],
      {
        is: (
          enablePriorAuthorizationSupport: boolean,
          priorAuthorizationContactProvider: boolean,
          priorAuthorizationContactAdmin: boolean
        ) =>
          enablePriorAuthorizationSupport &&
          !priorAuthorizationContactProvider &&
          !priorAuthorizationContactAdmin,
        then: (schema) =>
          schema.required('Prior authorization email is required').email('Invalid email')
      }
    ),
  priorAuthorizationExceptionMessage: yup.string(),
  providerUx: yup.object({
    enablePrescriberOrdering: yup.boolean().required('Please select true or false'),
    enablePrescribeToOrder: yup.boolean().required('Please select true or false'),
    enableRxTemplates: yup.boolean().required('Please select true or false'),
    enableDuplicateRxWarnings: yup.boolean().required('Please select true or false'),
    enableTreatmentHistory: yup.boolean().required('Please select true or false'),
    enablePatientRouting: yup.boolean().required('Please select true or false'),
    enablePickupPharmacies: yup.boolean().required('Please select true or false'),
    enableDeliveryPharmacies: yup.boolean().required('Please select true or false')
  }),
  patientUx: yup.object({
    enablePatientRerouting: yup.boolean().required('Please select true or false'),
    enablePatientDeliveryPharmacies: yup.boolean().required('Please select true or false'),
    patientFeaturedPharmacyName: yup.string()
  })
});

export type OrganizationSettingsFormValues = yup.InferType<typeof organizationSettingsFormSchema>;

export function createInitialOrgSettingsFormValues(
  args: OrganizationSettings
): OrganizationSettingsFormValues {
  return {
    brandColor: args.brandColor ?? '',
    brandLogo: args.brandLogo ?? undefined,
    supportContactAdmin: args.supportContactAdmin ?? false,
    supportName: args.supportName ?? undefined,
    supportEmail: args.supportEmail ?? undefined,
    enableRxClarificationSupport: args.enableRxClarificationSupport ?? false,
    rxClarificationContactProvider: args.rxClarificationContactProvider ?? false,
    rxClarificationContactAdmin: args.rxClarificationContactAdmin ?? false,
    rxClarificationName: args.rxClarificationName ?? undefined,
    rxClarificationEmail: args.rxClarificationEmail ?? undefined,
    enablePriorAuthorizationSupport: args.enablePriorAuthorizationSupport ?? false,
    priorAuthorizationContactProvider: args.priorAuthorizationContactProvider ?? false,
    priorAuthorizationContactAdmin: args.priorAuthorizationContactAdmin ?? false,
    priorAuthorizationName: args.priorAuthorizationName ?? undefined,
    priorAuthorizationEmail: args.priorAuthorizationEmail ?? undefined,
    priorAuthorizationExceptionMessage: args.priorAuthorizationExceptionMessage ?? undefined,
    providerUx: {
      enablePrescriberOrdering: args.providerUx?.enablePrescriberOrdering ?? false,
      enablePrescribeToOrder: args.providerUx?.enablePrescribeToOrder ?? false,
      enableRxTemplates: args.providerUx?.enableRxTemplates ?? false,
      enableDuplicateRxWarnings: args.providerUx?.enableDuplicateRxWarnings ?? false,
      enableTreatmentHistory: args.providerUx?.enableTreatmentHistory ?? false,
      enablePatientRouting: args.providerUx?.enablePatientRouting ?? false,
      enablePickupPharmacies: args.providerUx?.enablePickupPharmacies ?? false,
      enableDeliveryPharmacies: args.providerUx?.enableDeliveryPharmacies ?? false
    },
    patientUx: {
      enablePatientRerouting: args.patientUx?.enablePatientRerouting ?? false,
      enablePatientDeliveryPharmacies: args.patientUx?.enablePatientDeliveryPharmacies ?? false,
      patientFeaturedPharmacyName: args.patientUx?.patientFeaturedPharmacyName ?? undefined
    }
  };
}

export async function uploadBrandLogo({ env, file }: { env: Env; file: File }) {
  const apiUrl = clinicalApiUrl[env];

  const formData = new FormData();
  formData.append('file', file, file.name);

  const response = await fetch(`${apiUrl}/logo/upload`, {
    method: 'POST',
    body: formData
  });
  const data = await response.json();

  return data.url;
}
