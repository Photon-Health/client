import { gql } from '@apollo/client';

export const ORGANIZATION_FIELDS = gql`
  fragment OrganizationFields on Organization {
    id
    name
    settings {
      brandColor
      brandLogo
      priorAuthorizationExceptionMessage
      providerUx {
        enablePrescriberOrdering
        enablePrescribeToOrder
        enableRxTemplates
        enableDuplicateRxWarnings
        enableTreatmentHistory
        enablePatientRouting
        enablePickupPharmacies
        enableDeliveryPharmacies
      }
      patientUx {
        enablePatientRerouting
        enablePatientDeliveryPharmacies
        patientFeaturedPharmacyName
      }
    }
  }
`;

export const PATIENT_FIELDS = gql`
  fragment PatientFields on Patient {
    id
    externalId
    name {
      full
    }
    dateOfBirth
    sex
    gender
    email
    phone
    address {
      name {
        full
      }
      city
      country
      postalCode
      state
      street1
      street2
    }
  }
`;

export const ALLERGEN_FIELDS = gql`
  fragment AllergenFields on Allergen {
    id
    name
    rxcui
  }
`;

export const CATALOG_FIELDS = gql`
  fragment CatalogFields on Catalog {
    id
    name
  }
`;

export const MEDICATION_FIELDS = gql`
  fragment MedicationFields on Medication {
    id
    name
    form
    schedule
    controlled
  }
`;

export const SEARCH_MEDICATION_FIELDS = gql`
  fragment SearchMedicationFields on SearchMedication {
    id
    name
  }
`;

export const MEDICAL_EQUIPMENT_FIELDS = gql`
  fragment MedicalEquipmentFields on MedicalEquipment {
    id
    name
  }
`;

export const CATALOG_TREATMENT_FIELDS = gql`
  fragment CatalogTreatmentFields on Catalog {
    treatments {
      id
      name
    }
  }
`;

export const DISPENSE_UNIT_FIELDS = gql`
  fragment DispenseUnitFields on DispenseUnit {
    name
  }
`;

export const FILL_PRESCRIPTION_FIELDS = gql`
  fragment FillPrescriptionFields on Fill {
    id
    state
    requestedAt
    filledAt
    order {
      id
      createdAt
      state
      fulfillment {
        state
      }
      pharmacy {
        id
        name
        address {
          street1
          street2
          city
          state
          postalCode
        }
      }
    }
  }
`;

export const PRESCRIPTION_FIELDS = gql`
  ${FILL_PRESCRIPTION_FIELDS}
  fragment PrescriptionFields on Prescription {
    id
    externalId
    fills {
      ...FillPrescriptionFields
    }
    prescriber {
      id
      name {
        full
      }
    }
    patient {
      id
      name {
        full
      }
    }
    state
    treatment {
      id
      name
    }
    dispenseAsWritten
    dispenseQuantity
    dispenseUnit
    fillsAllowed
    fillsRemaining
    daysSupply
    instructions
    notes
    effectiveDate
    expirationDate
    writtenAt
  }
`;

export const FILL_FIELDS = gql`
  fragment FillFields on Fill {
    id
    prescription {
      id
    }
    treatment {
      name
    }
    state
    requestedAt
    filledAt
  }
`;

export const ORDER_FIELDS = gql`
  ${PATIENT_FIELDS}
  ${FILL_FIELDS}
  fragment OrderFields on Order {
    id
    externalId
    state
    fills {
      ...FillFields
    }
    patient {
      ...PatientFields
    }
    pharmacy {
      id
      name
      phone
      address {
        city
        country
        postalCode
        state
        street1
        street2
      }
    }
    fulfillment {
      type
      state
      carrier
      trackingNumber
    }
    createdAt
  }
`;

export const WEBHOOK_CONFIG_FIELDS = gql`
  fragment WebhookFields on WebhookConfig {
    id
    name
    filters
    url
  }
`;

export const CLIENT_FIELDS = gql`
  fragment ClientFields on Client {
    id
    name
    secret
    appType
  }
`;

export const PHARMACY_FIELDS = gql`
  fragment PharmacyFields on Pharmacy {
    id
    NPI
    NCPDP
    name
    fulfillmentTypes
    address {
      city
      country
      postalCode
      state
      street1
      street2
    }
  }
`;

export const PRESCRIPTION_TEMPLATE_FIELDS = gql`
  fragment PrescriptionTemplateFields on PrescriptionTemplate {
    id
    daysSupply
    dispenseAsWritten
    dispenseQuantity
    dispenseUnit
    instructions
    notes
    fillsAllowed
    treatment {
      id
      name
    }
    isPrivate
  }
`;
