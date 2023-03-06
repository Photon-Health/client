import * as Sentry from '@sentry/browser';
import { BrowserTracing } from '@sentry/tracing';
import pjson from './package.json';

Sentry.init({
  dsn: 'https://1d34034cd858470ba77ff10172425af2@o1356305.ingest.sentry.io/4504792337219584',
  environment: process.env.NODE_ENV,
  release: pjson.version,
  integrations: [new BrowserTracing()],
  tracesSampleRate: 1.0
});

export default Sentry;
