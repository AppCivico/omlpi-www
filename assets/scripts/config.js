const productionDomains = [
  'rnpiobserva.org.br',
  'dev.rnpiobserva.org.br',
  'inspiring-heisenberg-e2220d.netlify.app',
];

export default {
  api: {
    domain: (productionDomains.indexOf(window.location.hostname) > -1
      ? 'https://omlpi-api.appcivico.com/v2/'
      : 'https://dev-omlpi-api.appcivico.com/v2/'
    ),
    docs: (productionDomains.indexOf(window.location.hostname) > -1
      ? 'https://omlpi-docs.appcivico.com/'
      : '/'
    ),
  },
  apiCMS: {
    domain: (productionDomains.indexOf(window.location.hostname) > -1
      ? 'https://omlpi-strapi.appcivico.com/'
      : 'http://localhost:1337/'
    ),
  },
  storage: {
    domain: (productionDomains.indexOf(window.location.hostname) > -1
      ? 'https://omlpi-strapi.appcivico.com'
      : 'https://omlpi-strapi.appcivico.com'
    ),
  },
  firstCityId: 5200050,
};
