/* global Vue */
import config from './config';

if (document.querySelector('#app-home-indicators')) {
  window.$vueHomeIndicators = new Vue({
    el: '#app-home-indicators',
    data: {
      indicators: null,
      animationCount: 3,
      loadingLocales: false,
      additionalLocaleId: null,
      triggerAnimation: true,
      storageDomain: config.storage.domain,
      interval: null,
      intervalTime: 10000,
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
      startIndicatorsCounter(stop) {
        if (stop) {
          clearInterval(this.interval);
        } else {
          this.interval = setInterval(() => {
            this.getIndicators();
          }, this.intervalTime);
        }
      },
      getIndicators() {
        this.loadingLocales = true;
        let url = `${config.api.domain}data/random_indicator`;

        if (this.additionalLocaleId) {
          url = `${config.api.domain}data/random_indicator?locale_id_ne=${this.additionalLocaleId}`;
        }

        fetch(url)
          .then(this.startIndicatorsCounter(true))
          .then(response => response.json())
          .then((response) => {
            this.indicators = response;
            this.additionalLocaleId = response.locales[1].id;
            return true;
          })
          .then(() => {
            this.loadingLocales = false;
            this.startIndicatorsCounter();
            return true;
          });
      },
      getAxisClass(area) {
        if (area === 3) {
          return 'health';
        }
        if (area === 2) {
          return 'education';
        }
        return 'social-assistance';
      },
    },
  });
}
