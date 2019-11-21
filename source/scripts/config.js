export default {
  api: {
    domain: (window.location.hostname.indexOf('observatoriodaprimeirainfancia') !== -1
      ? 'https://omlpi-api.appcivico.com/v1/'
      : 'https://dev-omlpi-api.appcivico.com/v1/'),
  },
};
