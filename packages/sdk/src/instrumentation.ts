import { ApolloLink, Operation, NextLink, FetchResult } from '@apollo/client';
import { Observable } from '@apollo/client/utilities';
import { datadogRum } from '@datadog/browser-rum';

interface DatadogRum {
  addAction: (name: string, context?: Record<string, any>) => void;
  addTiming: (name: string, time?: number) => void;
  addError: (error: Error, context?: Record<string, any>) => void;
  getSessionReplayLink?: () => string | undefined;
  init: (config: any) => void;
  getInternalContext: any;
}

let sdkDatadogRum: DatadogRum | null = null;

export class DatadogInstrumentationLink extends ApolloLink {
  private isEnabled = false;

  constructor() {
    super();
    this.isEnabled = !!sdkDatadogRum;
  }

  public request(operation: Operation, forward: NextLink): Observable<FetchResult> | null {
    if (!this.isEnabled) {
      return forward(operation);
    }

    const operationName = operation.operationName || 'unnamed_operation';
    const operationType =
      operation.query.definitions[0]?.kind === 'OperationDefinition'
        ? (operation.query.definitions[0] as any).operation
        : 'query';

    const startTime = performance.now();
    const isServices = operation.getContext().uri?.includes('clinical-api') || false;
    const endpoint = isServices ? 'clinical-api' : 'api';

    return new Observable((observer) => {
      const subscription = forward(operation).subscribe({
        next: (result) => {
          const duration = performance.now() - startTime;

          sdkDatadogRum?.addAction('graphql_operation_success', {
            operation_name: operationName,
            operation_type: operationType,
            endpoint,
            duration_ms: Math.round(duration),
            has_errors: !!(result.errors && result.errors.length > 0),
            error_count: result.errors?.length || 0,
            cache_status: operation.getContext().cache ? 'hit' : 'miss',
            variables_count: Object.keys(operation.variables || {}).length
          });

          sdkDatadogRum?.addTiming(`graphql_${endpoint}_${operationName.toLowerCase()}`, duration);

          if (result.errors && result.errors.length > 0) {
            result.errors.forEach((error, index) => {
              sdkDatadogRum?.addError(new Error(`GraphQL Error: ${error.message}`), {
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

          sdkDatadogRum?.addAction('graphql_operation_error', {
            operation_name: operationName,
            operation_type: operationType,
            endpoint,
            duration_ms: Math.round(duration),
            has_errors: true,
            error_type: error.name || 'unknown',
            network_error: error.networkError ? true : false,
            variables_count: Object.keys(operation.variables || {}).length
          });

          sdkDatadogRum?.addError(error, {
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
}

export function createDatadogInstrumentationLink(): DatadogInstrumentationLink {
  return new DatadogInstrumentationLink();
}

export function initializeEmbeddedDatadogRUM(config: {
  applicationId: string;
  clientToken: string;
  env?: string;
  version?: string;
}): void {
  if (typeof window === 'undefined') return;

  const sdkRumConfig = {
    applicationId: config.applicationId,
    clientToken: config.clientToken,
    site: 'datadoghq.com',
    service: 'photon-sdk',
    env: config.env,
    version: config.version,
    sessionSampleRate: 100,
    sessionReplaySampleRate: 0,
    trackUserInteractions: false,
    trackResources: false,
    trackLongTasks: false,
    defaultPrivacyLevel: 'mask-user-input'
  };

  sdkDatadogRum = datadogRum;

  try {
    sdkDatadogRum.init(sdkRumConfig);
    console.log('SDK Datadog RUM initialized');
  } catch (error) {
    console.warn('Failed to initialize SDK Datadog RUM:', error);
    sdkDatadogRum = null;
  }
}
