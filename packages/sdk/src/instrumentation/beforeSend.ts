import type { RumInitConfiguration } from '@datadog/browser-rum-core/src/domain/configuration';
import {
  RumEvent,
  RumEventDomainContext,
  RumFetchResourceEventDomainContext
} from '@datadog/browser-rum';

export const datadogBeforeSendHandler: RumInitConfiguration['beforeSend'] = (
  event: RumEvent,
  context
) => {
  if (isResourceFetch(event, context) && event.context && hasRequestBody(context)) {
    try {
      const requestBody = JSON.parse(context.requestInit.body as string);
      event.context.operationName = requestBody.operationName;
      event.context.variables = requestBody.variables;
      event.context.query = requestBody.query;
    } catch (e) {
      console.warn('Error parsing request body:', e);
    }
  }
  return true;
};

function isResourceFetch(
  event: RumEvent,
  context: RumEventDomainContext
): context is RumFetchResourceEventDomainContext {
  return event.type === 'resource' && event.resource.type === 'fetch';
}

function hasRequestBody(
  context: RumFetchResourceEventDomainContext
): context is RumFetchResourceEventDomainContextWithRequestInit {
  return !!context.requestInit?.body;
}

interface RumFetchResourceEventDomainContextWithRequestInit
  extends RumFetchResourceEventDomainContext {
  requestInit: RequestInit & { body: BodyInit };
}
