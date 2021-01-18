/* global Vue */
import marked from 'marked';
import DOMPurify from 'dompurify';
import config from './config';

if (document.querySelector('#app-indicators-text')) {
  window.$vueHomeBanner = new Vue({
    el: '#app-indicators-text',
    data: {
      text: null,
    },
    computed: {
      loading() {
        return !this.text;
      },
    },
    async mounted() {
      await this.getText();
    },
    methods: {
      getText() {
        fetch(`${config.apiCMS.domain}textoindicadors`)
          .then(response => response.json())
          .then((response) => {
            this.text = response;
          });
      },
      marked(content) {
        return DOMPurify.sanitize(marked(content));
      },
    },
  });
}
