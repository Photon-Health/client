import { ApolloLink, FetchResult, NextLink, Operation } from '@apollo/client';
import { Observable } from '@apollo/client/utilities';
import { datadogRum } from '@datadog/browser-rum';
import { getClinicalDatadogAppId, getEmbedDatadogConfig } from './embed-datadog-config';

interface DatadogRum {
  addAction: (name: string, context?: Record<string, any>) => void;
  addTiming: (name: string, time?: number) => void;
  addError: (error: Error, context?: Record<string, any>) => void;
  init: (config: any) => void;
}

let embedDatadogRum: DatadogRum | null = null;

export class DatadogInstrumentationLink extends ApolloLink {
  private isEnabled = false;

  constructor() {
    super();
    this.isEnabled = !!embedDatadogRum;
  }

  public request(operation: Operation, forward: NextLink): Observable<FetchResult> | null {
    if (!this.isEnabled) {
      return forward(operation);
    }

    const operationName = operation.operationName || 'unnamed_operation';
    const operationType = this.getOperationType(operation);

    const startTime = performance.now();
    const endpoint = operation.getContext().isServices ? 'services' : 'lambdas';

    return new Observable((observer) => {
      const subscription = forward(operation).subscribe({
        next: (result) => {
          const duration = performance.now() - startTime;

          embedDatadogRum?.addAction('graphql_operation_success', {
            operation_name: operationName,
            operation_type: operationType,
            endpoint,
            duration_ms: Math.round(duration),
            has_errors: !!(result.errors && result.errors.length > 0),
            error_count: result.errors?.length || 0,
            variables_count: Object.keys(operation.variables || {}).length
          });

          embedDatadogRum?.addTiming(
            `graphql_${endpoint}_${operationName.toLowerCase()}`,
            duration
          );

          if (result.errors && result.errors.length > 0) {
            result.errors.forEach((error, index) => {
              embedDatadogRum?.addError(new Error(`GraphQL Error: ${error.message}`), {
                operation_name: operationName,
                operation_type: operationType,
                endpoint,
                error_index: index,
                error_path: error.path?.join('.') || 'unknown',
                error_code: (error.extensions as any)?.code || 'unknown'
              });
            });
          }

          observer.next(result);
        },
        error: (error) => {
          const duration = performance.now() - startTime;

          embedDatadogRum?.addAction('graphql_operation_error', {
            operation_name: operationName,
            operation_type: operationType,
            endpoint,
            duration_ms: Math.round(duration),
            has_errors: true,
            error_type: error.name || 'unknown',
            network_error: error.networkError ? true : false,
            variables_count: Object.keys(operation.variables || {}).length
          });

          embedDatadogRum?.addError(error, {
            operation_name: operationName,
            operation_type: operationType,
            endpoint,
            error_source: 'apollo_client'
          });

          observer.error(error);
        },
        complete: () => {
          observer.complete();
        }
      });

      return () => subscription.unsubscribe();
    });
  }

  private getOperationType(operation: Operation) {
    const operationDefinition = operation.query.definitions.find(
      (def) => def.kind === 'OperationDefinition'
    );
    if (operationDefinition) {
      return operationDefinition.operation;
    }
    return 'unknown';
  }
}

export function createDatadogInstrumentationLink(): DatadogInstrumentationLink {
  return new DatadogInstrumentationLink();
}

export function initializeEmbedDatadogRUM(config: { env?: string; version?: string }): void {
  if (isClinicalPhotonAppAlreadyConfigured()) return;

  const { applicationId, clientToken } = getEmbedDatadogConfig();
  const rumConfig = {
    applicationId,
    clientToken,
    site: 'datadoghq.com',
    service: 'photon-embed',
    env: config.env,
    version: config.version,
    sessionSampleRate: 100,
    sessionReplaySampleRate: 0,
    trackUserInteractions: false,
    trackResources: false,
    trackLongTasks: false,
    defaultPrivacyLevel: 'mask-user-input'
  };

  embedDatadogRum = datadogRum;

  try {
    embedDatadogRum.init(rumConfig);
    console.log('Embed Datadog RUM initialized');
  } catch (error) {
    console.warn('Failed to initialize Embed Datadog RUM:', error);
    embedDatadogRum = null;
  }
}

function isClinicalPhotonAppAlreadyConfigured(): boolean {
  const globalInitConfiguration = window.DD_RUM.getInitConfiguration();
  const hasExistingGlobalConfig = !!globalInitConfiguration;
  return (
    hasExistingGlobalConfig && globalInitConfiguration.applicationId === getClinicalDatadogAppId()
  );
}
