import * as Sentry from '@sentry/browser';

Sentry.init({
  dsn: 'https://15f95f8632a51920cc8b12a0f79d7ee1@o75154.ingest.sentry.io/4505987750100992',
  integrations: [
    new Sentry.BrowserTracing({
      tracePropagationTargets: [
        'localhost',
        /^https:\/\/(?:[\w-]+.)?rnpiobserva.org.br/,
        /^https:\/\/(?:[\w-]+.)?appcivico.com/,
      ],
    }),
    new Sentry.Replay(),
  ],

  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
