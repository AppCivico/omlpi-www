/* global Vue */
import marked from 'marked';
import DOMPurify from 'dompurify';
import config from './config';

window.$vueHomeIndicators = new Vue({
  el: '#app-home-indicators',
  data: {
    indicators: null,
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
        this.getIIndicators();
      }, 3000);
    },
    getIIndicators() {
      fetch(`${config.api.domain}data/random_indicator`)
        .then(response => response.json())
        .then((response) => {
          this.indicators = response;
        });
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
