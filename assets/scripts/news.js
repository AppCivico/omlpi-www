/* global Vue */
import config from './config';

if (document.querySelector('#app-news')) {
  window.$vueNews = new Vue({
    el: '#app-news',
    data: {
      news: null,
      storageDomain: config.storage.domain,
    },
    computed: {
      loading() {
        return !this.locale;
      },
    },
    async mounted() {
      await this.getNews();
    },
    methods: {
      getNews() {
        fetch(`${config.apiCMS.domain}noticias?_limit=30&_sort=date:ASC`)
          .then((response) => response.json())
          .then((response) => {
            this.news = response;
          });
      },
      convertDate(date) {
        return new Date(date).toLocaleDateString('pt-BR');
      },
    },
  });
}
