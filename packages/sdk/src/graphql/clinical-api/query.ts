import { graphql } from './gql';

export const SearchTreatmentsQuery = graphql(`
  query SearchTreatments($filter: TreatmentFilter!) {
    treatments(filter: $filter) {
      id
      name
    }
  }
`);
