/* global Vue */
import marked from 'marked';
import DOMPurify from 'dompurify';
import config from './config';

if (document.querySelector('#app-home-about')) {
  window.$vueHomeAbout = new Vue({
    el: '#app-home-about',
    data: {
      about: null,
      storageDomain: config.storage.domain,
    },
    computed: {
      loading() {
        return !this.locale;
      },
      hasNews() {
        return window.$vueNews && window.$vueNews.news && window.$vueNews.news.length > 0;
      },
    },
    async mounted() {
      await this.getAbout();
    },
    methods: {
      getAbout() {
        fetch(`${config.apiCMS.domain}sobres?_limit=1`)
          .then(response => response.json())
          .then((response) => {
            this.about = { ...response[0] };
          });
      },
      marked(content) {
        return DOMPurify.sanitize(marked(content));
      },
    },
  });
}
