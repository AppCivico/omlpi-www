/* global Vue */
import config from './config';

window.$vueHomeIndicators = new Vue({
  el: '#app-home-indicators',
  data: {
    indicators: null,
    triggerAnimation: true,
    storageDomain: config.storage.domain,
  },
  computed: {
    loading() {
      return !this.locale;
    },
  },
  async mounted() {
    await this.getIIndicators();
    this.startIndicatorsCounter();
  },
  methods: {
    startIndicatorsCounter() {
      setInterval(() => {
        this.indicators = {};
        this.getIIndicators();
      }, 6000);
    },
    getIIndicators() {
      this.triggerAnimation = false;
      fetch(`${config.api.domain}data/random_indicator`)
        .then(response => response.json())
        .then((response) => {
          this.indicators = response;
        })
        .then((this.triggerAnimation = true));
    },
    getAxisClass(area) {
      if (area === 1) {
        return 'health';
      }
      if (area === 2) {
        return 'education';
      }
      return 'social-assistance';
    },
  },
});
