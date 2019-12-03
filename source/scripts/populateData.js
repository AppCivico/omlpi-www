/* global Vue */
import config from './config';

if (window.location.href.indexOf('city') > -1) {
  window.$vue = new Vue({
    el: '#app',
    data: {
      localeId: window.location.search.split('id=')[1],
      locale: null,
    },
    computed: {
      loading() {
        return !this.locale;
      },
    },
    created() {},
    mounted() {
      this.getData();
    },
    methods: {
      async getData() {
        const response = await fetch(`${config.api.domain}data?locale_id=${this.localeId}`);
        const json = await response.json();
        this.locale = json.locale;
      },
    },
  });
}
