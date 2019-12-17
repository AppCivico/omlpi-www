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
      setLocale(localeId) {
        this.selectedLocale = this.locales.filter(locale => locale.id === localeId);
      },
      getInfoGraphic() {
        fetch(`${config.apiCMS.domain}infographics/1`)
          .then(response => response.json())
          .then((response) => {
            this.infographic = {};
            this.infographic.small = `${config.storage.domain}${response.big.url}`;
            this.infographic.big = `${config.storage.domain}${response.small.url}`;
            this.infographic.url = `${config.storage.domain}${response.pdf.url}`;
          });
      },
    },
  });
}
