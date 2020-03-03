export default {
  api: {
    domain: (window.location.hostname.indexOf('observatoriodaprimeirainfancia') !== -1
      ? 'https://omlpi-api.appcivico.com/v1/'
      : 'https://dev-omlpi-api.appcivico.com/v1/'),
    docs: (window.location.hostname.indexOf('observatoriodaprimeirainfancia') !== -1
      ? 'https://omlpi-docs.appcivico.com/'
      : 'https://dev-omlpi-docs.appcivico.com/'),
  },
  apiCMS: {
    domain: (window.location.hostname.indexOf('observatoriodaprimeirainfancia') !== -1
      ? 'https://omlpi-strapi.appcivico.com/'
      : 'https://dev-omlpi-strapi.appcivico.com/'),
  },
  storage: {
    domain: (window.location.hostname.indexOf('observatoriodaprimeirainfancia') !== -1
      ? 'https://omlpi-strapi.appcivico.com/'
      : 'https://dev-omlpi-strapi.appcivico.com/'),
  },
  fisrtCityId: 5200050,
};
