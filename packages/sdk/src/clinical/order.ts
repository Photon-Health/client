import { ApolloClient, DocumentNode, gql, NormalizedCacheObject } from '@apollo/client';
import { ORDER_FIELDS } from '../fragments';
import { makeMutation, makeQuery } from '../utils';
import { Maybe, Order } from '../types';

/**
 * GetOrders options
 * @param patientId Filter order by patient id
 * @param patientName Filter order by patient name
 * @param after Paginated query after this cursor
 * @param first Specify page size limit (default: 25)
 * @param fragment Allows you to override the default query to request more fields
 */
export interface GetOrdersOptions {
  patientId?: string;
  patientName?: string;
  after?: string;
  first?: number;
  fragment?: Record<string, DocumentNode>;
}

/**
 * GetOrder options
 * @param id The id of the order
 * @param fragment Allows you to override the default query to request more fields
 */
export interface GetOrderOptions {
  id?: string;
  fragment?: Record<string, DocumentNode>;
}

/**
 * CreateORder options
 * @param fragment Allows you to override the default query to request more fields
 */
export interface CreateOrderOptions {
  id?: string;
  fragment?: Record<string, DocumentNode>;
}

/**
 * Contains various methods for Photon Orders
 */
export class OrderQueryManager {
  private apollo: ApolloClient<undefined> | ApolloClient<NormalizedCacheObject>;

  /**
   * @param apollo - An Apollo client instance
   */
  constructor(apollo: ApolloClient<undefined> | ApolloClient<NormalizedCacheObject>) {
    this.apollo = apollo;
  }

  /**
   * Retrieves all orders in a paginated fashion, optionally filtered by patientId, patientName
   * @param options - Query options
   * @returns
   */
  public async getOrders(
    { patientId, patientName, after, first, fragment }: GetOrdersOptions = {
      first: 25,
      fragment: { OrderFields: ORDER_FIELDS }
    }
  ) {
    if (!first) {
      first = 25;
    }
    if (!fragment) {
      fragment = { OrderFields: ORDER_FIELDS };
    }
    let [fName, fValue] = Object.entries(fragment)[0];
    const GET_ORDERS = gql`
        ${fValue}
        query orders(
          $patientId: ID
          $patientName: String
          $after: ID
          $first: Int
      ) {
          orders(
              filter: {
                  patientId: $patientId
                  patientName: $patientName
              }
              after: $after
              first: $first
          ) {
              ...${fName}
          }
        }
      `;
    return makeQuery<{ orders: Order[] }>(this.apollo, GET_ORDERS, {
      patientId,
      patientName,
      after,
      first
    });
  }

  /**
   * Retrieves order by id
   * @param options - Query options
   * @returns
   */
  public async getOrder(
    { id, fragment }: GetOrderOptions = {
      id: '',
      fragment: { OrderFields: ORDER_FIELDS }
    }
  ) {
    if (!fragment) {
      fragment = { OrderFields: ORDER_FIELDS };
    }
    let [fName, fValue] = Object.entries(fragment)[0];
    const GET_ORDER = gql`
        ${fValue}
        query order($id: ID!) {
          order(id: $id) {
            ...${fName}
          }
        }
      `;
    return makeQuery<{ order: Order }>(this.apollo, GET_ORDER, { id: id });
  }

  /**
   * Creates a new order
   * @param options - Query options
   * @returns
   */
  public createOrder({ fragment }: CreateOrderOptions) {
    if (!fragment) {
      fragment = { OrderFields: ORDER_FIELDS };
    }
    let [fName, fValue] = Object.entries(fragment)[0];
    const CREATE_ORDER = gql`
      ${fValue}
      mutation createOrder(
        $externalId: ID
        $patientId: ID!
        $fills: [FillInput!]!
        $address: AddressInput!
        $pharmacyId: ID!
      ) {
        createOrder(
          externalId: $externalId
          patientId: $patientId
          fills: $fills
          address: $address
          pharmacyId: $pharmacyId
        ) {
          ...${fName}
        }
      }
    `;
    return makeMutation<{ createOrder: Order } | undefined | null>(this.apollo, CREATE_ORDER);
  }
}
