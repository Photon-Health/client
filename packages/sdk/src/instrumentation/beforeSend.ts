import type {
  RumEvent,
  RumEventDomainContext,
  RumFetchResourceEventDomainContext
} from '@datadog/browser-rum';

export const datadogBeforeSendHandler = (event: RumEvent, context: RumEventDomainContext) => {
  if (isResourceFetch(event, context) && hasRequestBody(context)) {
    addGraphqlAttributesToContext(event, context);
  }
  // for Photon's clinical app, we can log all the events
  // by returning true
  return true;
};

export const embedDatadogBeforeSendHandler = (
  event: RumEvent,
  context: RumEventDomainContext,
  allowedUrls: string[]
) => {
  if (isResourceFetch(event, context) && hasRequestBody(context)) {
    addGraphqlAttributesToContext(event, context);

    // for customers using the embed, we need to prevent logging of their internal fetch requests
    // by returning false
    return isAllowedResource(context, allowedUrls);
  }

  // prevents warning log Datadog Browser SDK: Can't dismiss view events using beforeSend!
  return event.type === 'view';
};

function addGraphqlAttributesToContext(
  event: RumEvent,
  context: RumFetchResourceEventDomainContextWithRequestInit
) {
  if (!event.context) return;

  try {
    const requestBody = JSON.parse(context.requestInit.body as string);
    event.context.operationName = requestBody.operationName;
    event.context.variables = requestBody.variables;
    event.context.query = requestBody.query;
  } catch (e) {
    console.warn('Error parsing request body:', e);
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
