import {
  RumEvent,
  RumEventDomainContext,
  RumFetchResourceEventDomainContext
} from '@datadog/browser-rum';

export const datadogBeforeSendHandler = (event: RumEvent, context: RumEventDomainContext) => {
  addGraphqlToContext(event, context);
  return true;
};

export const embedDatadogBeforeSendHandler = (
  event: RumEvent,
  context: RumEventDomainContext,
  allowedUrls: string[]
) => {
  addGraphqlToContext(event, context);

  // for customers using the embed, we need to prevent logging of their internal fetch requests
  return isResourceFetch(event, context) && isAllowedResource(context, allowedUrls);
};

function addGraphqlToContext(event: RumEvent, context: RumEventDomainContext) {
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
}

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

function isAllowedResource(context: RumFetchResourceEventDomainContext, allowedUrls: string[]) {
  const requestInput = context.requestInput;
  return isStringUri(requestInput) && allowedUrls.some((url) => requestInput.includes(url));
}

function isStringUri(requestInput: RequestInfo): requestInput is string {
  return typeof requestInput === 'string';
}

interface RumFetchResourceEventDomainContextWithRequestInit
  extends RumFetchResourceEventDomainContext {
  requestInit: RequestInit & { body: BodyInit };
}
