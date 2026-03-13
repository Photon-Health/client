import { graphql } from './gql';

export const SearchTreatmentsQuery = graphql(`
  query SearchTreatments($filter: TreatmentFilter!) {
    treatments(filter: $filter) {
      id
      name
      ... on Medication {
        doseForms {
          name
        }
      }
    }
  }
`);

export const SearchTreatmentOptionsQuery = graphql(`
  query SearchTreatmentOptionsQuery($filter: TreatmentFilter!) {
    treatments(filter: $filter) {
      __typename
      id
      name
      ... on Medication {
        doseForms {
          name
        }
        packageDetails {
          packaging
          quantity
          size
          doseForm
          unitDose
        }
      }
    }
  }
`);
