/* global Vue */
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import config from './config';

if (document.querySelector('#app-home-banner')) {
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
        fetch(`${config.apiCMS.domain}banners`)
          .then((response) => response.json())
          .then((response) => {
            this.banner = response;
          });
      },
      marked(content) {
        return DOMPurify.sanitize(marked(content));
      },
    },
  });
}
