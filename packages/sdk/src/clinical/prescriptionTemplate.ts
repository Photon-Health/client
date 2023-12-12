import { ApolloClient, DocumentNode, gql, NormalizedCacheObject } from '@apollo/client';
import { PRESCRIPTION_TEMPLATE_FIELDS } from '../fragments';
import { PrescriptionTemplate } from '../types';
import { makeMutation } from '../utils';

export interface CreatePrescriptionTemplateOptions {
  fragment?: Record<string, DocumentNode>;
}

export interface UpdatePrescriptionTemplateOptions {
  fragment?: Record<string, DocumentNode>;
}

export interface DeletePrescriptionTemplateOptions {
  fragment?: Record<string, DocumentNode>;
}

/**
 * Contains various methods for Photon Prescription Templates
 */
export class PrescriptionTemplateQueryManager {
  private apollo: ApolloClient<undefined> | ApolloClient<NormalizedCacheObject>;

  /**
   * @param apollo - An Apollo client instance
   */
  constructor(apollo: ApolloClient<undefined> | ApolloClient<NormalizedCacheObject>) {
    this.apollo = apollo;
  }

  /**
   * Creates a new prescription template
   * @param options - Query options
   * @returns
   */
  public createPrescriptionTemplate({ fragment }: CreatePrescriptionTemplateOptions) {
    if (!fragment) {
      fragment = { PrescriptionTemplateFields: PRESCRIPTION_TEMPLATE_FIELDS };
    }
    const [fName, fValue] = Object.entries(fragment)[0];
    const CREATE_PRESCRIPTION_TEMPLATE = gql`
        ${fValue}
        mutation createPrescriptionTemplate(
          $catalogId: ID!,
          $treatmentId: ID!,
          $dispenseAsWritten: Boolean,
          $dispenseQuantity: Float,
          $dispenseUnit: String,
          $fillsAllowed: Int,
          $daysSupply: Int,
          $instructions: String,
          $notes: String,
          $name: String,
          $isPrivate: Boolean
        ) {
          createPrescriptionTemplate(
            catalogId: $catalogId
            treatmentId: $treatmentId
            dispenseAsWritten: $dispenseAsWritten
            dispenseQuantity: $dispenseQuantity
            dispenseUnit: $dispenseUnit
            fillsAllowed: $fillsAllowed
            daysSupply: $daysSupply
            instructions: $instructions
            notes: $notes
            name: $name
            isPrivate: $isPrivate
        ) {
            ...${fName}
        }
      }
      `;
    return makeMutation<{ createPrescriptionTemplate: PrescriptionTemplate } | undefined | null>(
      this.apollo,
      CREATE_PRESCRIPTION_TEMPLATE
    );
  }

  /**
   * Updates a prescription template
   * @param options - Query options
   * @returns
   */
  public updatePrescriptionTemplate({ fragment }: UpdatePrescriptionTemplateOptions) {
    if (!fragment) {
      fragment = { PrescriptionTemplateFields: PRESCRIPTION_TEMPLATE_FIELDS };
    }
    const [fName, fValue] = Object.entries(fragment)[0];
    const UPDATE_PRESCRIPTION_TEMPLATE = gql`
        ${fValue}
        mutation updatePrescriptionTemplate(
          $catalogId: ID!,
          $templateId: ID!,
          $dispenseAsWritten: Boolean,
          $dispenseQuantity: Float,
          $dispenseUnit: String,
          $fillsAllowed: Int,
          $daysSupply: Int,
          $instructions: String,
          $notes: String,
          $name: String
        ) {
          updatePrescriptionTemplate(
            catalogId: $catalogId
            templateId: $templateId
            dispenseAsWritten: $dispenseAsWritten
            dispenseQuantity: $dispenseQuantity
            dispenseUnit: $dispenseUnit
            fillsAllowed: $fillsAllowed
            daysSupply: $daysSupply
            instructions: $instructions
            notes: $notes
            name: $name
        ) {
            ...${fName}
        }
      }
      `;
    return makeMutation<{ updatePrescriptionTemplate: PrescriptionTemplate } | undefined | null>(
      this.apollo,
      UPDATE_PRESCRIPTION_TEMPLATE
    );
  }

  /**
   * Deletes an existing prescription template
   * @param options - Query options
   * @returns
   */
  public deletePrescriptionTemplate({ fragment }: DeletePrescriptionTemplateOptions) {
    if (!fragment) {
      fragment = { PrescriptionTemplateFields: PRESCRIPTION_TEMPLATE_FIELDS };
    }
    const [fName, fValue] = Object.entries(fragment)[0];
    const DELETE_PRESCRIPTION_TEMPLATE = gql`
        ${fValue}
        mutation deletePrescriptionTemplate(
          $catalogId: ID!,
          $templateId: ID!
        ) {
          deletePrescriptionTemplate(
            catalogId: $catalogId
            templateId: $templateId
        ) {
            ...${fName}
        }
      }
      `;
    return makeMutation<{ deletePrescriptionTemplate: PrescriptionTemplate } | undefined | null>(
      this.apollo,
      DELETE_PRESCRIPTION_TEMPLATE
    );
  }
}
