const productionDomains = ['rnpiobserva.org.br', 'inspiring-heisenberg-e2220d.netlify.app'];

export default {
  api: {
    domain: (productionDomains.indexOf(window.location.hostname) > -1
      ? 'https://omlpi-api.appcivico.com/v2/'
      : 'https://dev-omlpi-api.appcivico.com/v2/'),
    docs: (productionDomains.indexOf(window.location.hostname) > -1
      ? 'https://omlpi-docs.appcivico.com/'
      : 'https://dev-omlpi-docs.appcivico.com/'),
  },
  apiCMS: {
    domain: (productionDomains.indexOf(window.location.hostname) > -1
      ? 'https://omlpi-strapi.appcivico.com/'
      : 'https://omlpi-strapi.appcivico.com/'),
  },
  storage: {
    domain: (productionDomains.indexOf(window.location.hostname) > -1
      ? 'https://omlpi-strapi.appcivico.com'
      : 'https://omlpi-strapi.appcivico.com'),
  },
  fisrtCityId: 5200050,
};
