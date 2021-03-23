import * as Sentry from '@sentry/browser';
import { Integrations } from '@sentry/tracing';

Sentry.init({
  dsn: 'https://0b3313ced14347eeb247f647a45fa8a9@sentry.appcivico.com/6',
  integrations: [new Integrations.BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});
