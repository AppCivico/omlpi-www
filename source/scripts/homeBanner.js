/* global Vue */
import marked from 'marked';
import DOMPurify from 'dompurify';
import config from './config';

window.$vueHomeBanner = new Vue({
  el: '#app-home-banner',
  data: {
    banner: null,
    storageDomain: config.storage.domain,
  },
  computed: {
    loading() {
      return !this.locale;
    },
  },
  async mounted() {
    await this.getBanner();
  },
  methods: {
    getBanner() {
      fetch(`${config.apiCMS.domain}banners?_limit=1`)
        .then(response => response.json())
        .then((response) => {
          this.banner = { ...response[0] };
        });
    },
    marked(content) {
      return DOMPurify.sanitize(marked(content));
    },
  },
});
