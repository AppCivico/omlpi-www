/* global Vue */
import marked from 'marked';
import DOMPurify from 'dompurify';
import config from './config';

window.$vueAxis = new Vue({
  el: '#app-axis',
  data: {
    axis: null,
    storageDomain: config.storage.domain,
  },
  computed: {
    loading() {
      return !this.locale;
    },
  },
  async mounted() {
    await this.getAxis();
  },
  methods: {
    getAxis() {
      fetch(`${config.apiCMS.domain}eixos?_limit=30&_sort=order:ASC`)
        .then(response => response.json())
        .then((response) => {
          this.axis = response;
        });
    },
    marked(content) {
      return DOMPurify.sanitize(marked(content));
    },
    getLoopClass(index) {
      if (index === 0) {
        return 'fadeInLeft';
      }
      if (index === 2) {
        return 'fadeInRight';
      }
      return true;
    },
  },
});
