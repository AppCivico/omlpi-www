/* global Vue */
import config from './config';

if (document.querySelector('#app-history')) {
  window.$vueHomeIndicators = new Vue({
    el: '#app-home-indicators',
    data: {
      indicators: null,
      loadingLocales: false,
      additionalLocaleId: null,
      triggerAnimation: true,
      storageDomain: config.storage.domain,
    },
    computed: {
      loading() {
        return !this.locale;
      },
    },
    async mounted() {
      await this.getIndicators();
      this.startIndicatorsCounter();
    },
    methods: {
      startIndicatorsCounter() {
        setInterval(() => {
          this.getIndicators();
        }, 6000);
      },
      getIndicators() {
        this.loadingLocales = true;
        let url = `${config.api.domain}data/random_indicator`;

        if (this.additionalLocaleId) {
          url = `${config.api.domain}data/random_indicator?locale_id_ne=${this.additionalLocaleId}`;
        }

        fetch(url)
          .then(response => response.json())
          .then((response) => {
            this.indicators = response;
            this.additionalLocaleId = response.locales[1].id;
            return true;
          })
          .then(() => {
            this.loadingLocales = false;
            return true;
          });
      },
    },
  });
}
