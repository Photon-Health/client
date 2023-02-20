import { ApolloClient, DocumentNode, gql, NormalizedCacheObject } from '@apollo/client';
import { MEDICAL_EQUIPMENT_FIELDS } from '../fragments';
import { makeQuery } from '../utils';
import { MedicalEquipment } from '../types';

/**
 * GetMedicalEquipment options
 * @param string Filter medical equipment by name
 * @param fragment Allows you to override the default query to request more fields
 */
export interface GetMedicalEquipmentOptions {
  name?: String;
  after?: String;
  first?: Number;
  fragment?: Record<string, DocumentNode>;
}

/**
 * Contains various methods for Photon Medical Equipment
 */
export class MedicalEquipmentQueryManager {
  private apollo: ApolloClient<undefined> | ApolloClient<NormalizedCacheObject>;

  /**
   * @param apollo - An Apollo client instance
   */
  constructor(apollo: ApolloClient<undefined> | ApolloClient<NormalizedCacheObject>) {
    this.apollo = apollo;
  }

  /**
   * Retrieves all medical equipment, optionally filtered by name, type, and code
   * @param options - Query options
   * @returns
   */
  public async getMedicalEquipment(
    { name, after, first, fragment }: GetMedicalEquipmentOptions = {
      fragment: { MedicalEquipmentFields: MEDICAL_EQUIPMENT_FIELDS }
    }
  ) {
    if (!fragment) {
      fragment = { MedicalEquipmentFields: MEDICAL_EQUIPMENT_FIELDS };
    }
    let [fName, fValue] = Object.entries(fragment)[0];
    const GET_MEDICAL_EQUIPMENT = gql`
      ${fValue}
      query medicalEquipment($name: String, $after: ID, $first: Int) {
        medicalEquipment(name: $name, after: $after, first: $first) {
          ...${fName}
    }
  }
    `;
    return makeQuery<{ medicalEquipment: MedicalEquipment[] }>(this.apollo, GET_MEDICAL_EQUIPMENT, {
      name,
      after,
      first
    });
  }
}
