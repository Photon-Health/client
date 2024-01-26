import { ApolloClient, mergeOptions } from '@apollo/client/core';
import type {
  DefaultContext,
  OperationVariables,
  MutationOptions,
  FetchResult
} from '@apollo/client/core';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
import type { GraphQLError } from 'graphql';
import type { Accessor } from 'solid-js';
import { createResource, createSignal, untrack } from 'solid-js';

interface BaseOptions<TData, TVariables, TContext>
  extends Omit<MutationOptions<TData, TVariables, TContext>, 'mutation'> {
  ignoreResults?: boolean;
  client: ApolloClient<any>; // enforce a client being present since we have two
}

type CreateMutationOptions<
  TData,
  TVariables extends OperationVariables,
  TContext extends Record<string, any>
> = BaseOptions<TData, TVariables, TContext> | Accessor<BaseOptions<TData, TVariables, TContext>>;

export const createMutation = <
  TData = any,
  TVariables extends OperationVariables = OperationVariables,
  TContext extends Record<string, any> = DefaultContext // Changed here: Added 'extends Record<string, any>'
>(
  mutation: DocumentNode<TData, TVariables>,
  options: CreateMutationOptions<TData, TVariables, TContext>
) => {
  const resolvedOptions = typeof options === 'function' ? options() : options; // could be accessor or object
  const client = resolvedOptions.client;
  let resolveResultPromise: ((data: TData) => void) | null = null;
  let rejectResultPromise: ((error: GraphQLError) => void) | null = null;

  const [executionOptions, setExecutionOptions] = createSignal<
    false | MutationOptions<TData, TVariables, TContext>
  >(false);
  const [resource] = createResource(executionOptions, async (opts) => {
    let result: FetchResult<TData>;
    try {
      result = await client.mutate<TData, TVariables, TContext>(opts);
    } catch (error) {
      if (rejectResultPromise) {
        rejectResultPromise(error as GraphQLError);
        rejectResultPromise = null;
      }
      throw error;
    }
    const { data, errors } = result;
    if (errors) {
      if (rejectResultPromise) {
        rejectResultPromise(errors[0]);
        rejectResultPromise = null;
      }
      throw errors[0];
    }

    if (data !== undefined && data !== null) {
      if (resolveResultPromise) {
        resolveResultPromise(data);
        resolveResultPromise = null;
      }
      return data;
    } else {
      throw new Error('Mutation did not return any data.');
    }
  });

  return [
    async (opts: Omit<BaseOptions<TData, TVariables, TContext>, 'client'>) => {
      const mergedOptions = mergeOptions<MutationOptions<TData, TVariables, TContext>>(opts, {
        mutation,
        ...(typeof options === 'function' ? untrack(options) : options)
      });

      setExecutionOptions(mergedOptions);
      return new Promise<TData>((resolve, reject) => {
        resolveResultPromise = resolve;
        rejectResultPromise = reject;
      });
    },
    resource
  ] as const;
};
