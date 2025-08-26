import type {
  RumEvent,
  RumEventDomainContext,
  RumFetchResourceEventDomainContext
} from '@datadog/browser-rum';

const photonApiHostnames = [
  process.env.REACT_APP_GRAPHQL_URI as string,
  process.env.REACT_APP_CLINICAL_GRAPHQL_URI as string
].map(getHostnameFromUrl);

export const beforeSendHandler = (event: RumEvent, context: RumEventDomainContext) => {
  if (
    isResourceFetch(event, context) &&
    hasRequestBody(context) &&
    isPhotonApiRequest(context.requestInput)
  ) {
    addGraphqlAttributesToContext(event, context);
  }
  // allow log to be sent to datadog by returning true
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

function isPhotonApiRequest(requestInput: RequestInfo): boolean {
  const url = typeof requestInput === 'string' ? requestInput : requestInput.url;
  return photonApiHostnames.includes(getHostnameFromUrl(url));
}

function addGraphqlAttributesToContext(
  event: RumEvent,
  context: RumFetchResourceEventDomainContextWithRequestInit
) {
  if (!event.context) return;

  try {
    const requestBody = JSON.parse(context.requestInit.body);
    event.context.operationName = requestBody.operationName;
    event.context.variables = requestBody.variables;
    event.context.query = requestBody.query;
  } catch (e) {
    console.warn('Error parsing request body:', e);
  }
}

function getHostnameFromUrl(url: string): string {
  const urlObj = new URL(url);
  return urlObj.hostname;
}

interface RumFetchResourceEventDomainContextWithRequestInit
  extends RumFetchResourceEventDomainContext {
  requestInit: RequestInit & { body: string };
}
