/* global Vue */
import config from './config';

if (window.location.href.indexOf('plano-para-primeira-infancia') > -1) {
  window.$vuePlans = new Vue({
    el: '#app',
    data: {
      infographic: null,
      locales: null,
      selectedLocale: null,
      selectedLocaleId: null,
      relatedLocales: null,
      capital: null,
      storageDomain: config.storage.domain,
    },
    computed: {
      loading() {
        return !this.locale;
      },
    },
    async mounted() {
      await this.getInfoGraphic();
      await this.getLocales();
    },
    methods: {
      async getLocales() {
        const response = await fetch(`${config.apiCMS.domain}locales/1`);
        const json = await response.json();
        this.locale = json.locale;
      },
      setMapDestak(locale) {
        const map = document.querySelector('.js-brazil-map');

        if (map.querySelector('.active')) {
          map.querySelector('.active').classList.remove('active');
        }

        map.querySelector(`.${locale}`).classList.add('active');
      },
      setLocale(localeId) {
        this.resetSelectedLocales();
        this.selectedLocale = this.locales.find(locale => locale.id === localeId);

        if (this.selectedLocale.type === 'state') {
          const cities = this.locales.filter(
            locale => locale.type === 'city' && locale.state === this.selectedLocale.state,
          );
          this.capital = this.locales.find(
            locale => locale.type === 'city' && locale.state === this.selectedLocale.state && locale.is_capital,
          );
          this.relatedLocales = this.getSectionedLocales(cities)
            .sort((a, b) => ((a.title > b.title) ? 1 : -1));

          this.setMapDestak(this.selectedLocale.state);
        }

        if (this.selectedLocale.type === 'region') {
          const states = this.locales.filter(
            locale => locale.type === 'state' && locale.region === this.selectedLocale.region,
          );
          this.relatedLocales = this.getSectionedLocales(states)
            .sort((a, b) => ((a.title > b.title) ? 1 : -1));

          this.setMapDestak(this.selectedLocale.region);
        }

        if (this.selectedLocale.type === 'city') {
          this.setMapDestak(this.selectedLocale.state);
        }
      },
      getSectionedLocales(locales) {
        return Object.values(
          locales.reduce((acc, locale) => {
            const firstLetter = locale.name[0].toLocaleUpperCase();
            if (!acc[firstLetter]) {
              acc[firstLetter] = { title: firstLetter, data: [locale] };
            } else {
              acc[firstLetter].data.push(locale);
            }
            return acc;
          }, {}),
        );
      },
      resetSelectedLocales() {
        this.selectedLocale = null;
        this.selectedLocaleId = null;
        this.relatedLocales = null;
        this.capital = null;
      },
      getInfoGraphic() {
        fetch(`${config.apiCMS.domain}infographics/1`)
          .then(response => response.json())
          .then((response) => {
            this.infographic = {};
            if (response.small && response.small.url) {
              this.infographic.small = `${config.storage.domain}${response.small.url}`;
            }

            if (response.big && response.big.url) {
              this.infographic.big = `${config.storage.domain}${response.big.url}`;
            }

            if (response.pdf && response.pdf.url) {
              this.infographic.url = `${config.storage.domain}${response.pdf.url}`;
            }
          });
      },
    },
  });
}
