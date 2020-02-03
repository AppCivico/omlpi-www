/* global Vue */
import _uniqBy from 'lodash/uniqBy';
import config from './config';

if (window.location.href.indexOf('biblioteca') > -1) {
  window.$vueArticles = new Vue({
    el: '#app',
    data: {
      articles: null,
      searchQuery: null,
      storageDomain: config.storage.domain,
      has_more: true,
      itens_qtd: 1,
      pagination_start: 0,
      pagination_limit: 15,
    },
    computed: {
      loading() {
        return !this.locale;
      },
    },
    async mounted() {
      await this.getArticles();
    },
    methods: {
      getArticles(loadMore) {
        if (loadMore) {
          this.pagination_start = this.pagination_start + this.itens_qtd;
          this.pagination_limit = this.pagination_limit + this.itens_qtd;
        }
        fetch(`${config.apiCMS.domain}artigos?_start=${this.pagination_start}&_limit=${this.pagination_limit}`)
          .then(response => response.json())
          .then((response) => {
            if (response.length === 0) {
              this.has_more = false;
            }
            if (loadMore) {
              this.articles = [...this.articles, ...response];
            } else {
              this.articles = response;
            }
          });
      },
      async searchArticles() {
        let articles;
        let tagged;

        await fetch(`${config.apiCMS.domain}artigos?title_contains=${this.searchQuery}`)
          .then(response => response.json())
          .then((response) => { articles = response; });

        await fetch(`${config.apiCMS.domain}artigos/tagged/${this.searchQuery}`)
          .then(response => response.json())
          .then((response) => { tagged = response; });

        await fetch(`${config.apiCMS.domain}artigos?author_contains=${this.searchQuery}`)
          .then(response => response.json())
          .then((response) => {
            this.articles = _uniqBy([...articles, ...tagged, ...response], 'id');
          });
      },

      async searchByTag(tag) {
        await fetch(`${config.apiCMS.domain}artigos/tagged/${tag}`)
          .then(response => response.json())
          .then((response) => { this.articles = response; });
      },
    },
  });
}
