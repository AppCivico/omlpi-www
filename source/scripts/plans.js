/* global Vue */
import config from './config';

if (window.location.href.indexOf('plano-para-primeira-infancia') > -1) {
  window.$vuePlans = new Vue({
    el: '#app',
    data: {
      locale: null,
      infographic: null,
    },
    computed: {
      loading() {
        return !this.locale;
      },
      indicatorsCount() {
        return this.locale.indicators.filter(
          indicator => indicator.area.id === this.selectedArea,
        ).length;
      },
    },
    async mounted() {
      await this.getInfoGraphic();
    },
    methods: {
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
