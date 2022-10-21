/* global Vue */
import config from './config';

if (window.location.href.indexOf('biblioteca') > -1) {
  window.$vueArticles = new Vue({
    el: '#app',
    data: {
      currentVideo: '',
      articles: null,
      searchQuery: null,
      searchSuggestions: [],
      pending: {
        articles: true,
      },
      storageDomain: config.storage.domain,
      has_more: false,
      pagination_offset: 0,
      pagination_limit: 15,
    },
    computed: {
      loading() {
        return !this.locale;
      },
    },
    async mounted() {
      await this.getArticles();
      this.getSearchSuggestions();
      // await this.putHasmoreButtons();
    },
    methods: {
      toggleModal(youtubeUrl = '') {
        let func = '';
        if (youtubeUrl) {
          const re = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(\S+)?$/i;
          const videoId = (youtubeUrl.match(re) || [])[5] || '';
          const embedUrl = videoId
            ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&showinfo=0&enablejsapi=1&origin=${window.location.origin}`
            : '';

          func = !videoId ? 'pauseVideo' : 'playVideo';
          if (embedUrl !== this.currentVideo) {
            this.currentVideo = embedUrl;
          } else {
            func = 'pauseVideo';
          }
        } else {
          this.currentVideo = '';
        }

        this.$refs.iframeYoutube.contentWindow.postMessage(`{"event":"command","func":"${func}","args":""}`, '*');
      },
      // putHasmoreButtons() {
      //   Object.keys(this.$refs).forEach((item) => {
      //     const description = this.$refs[item][0].querySelector('.library-item__description');
      //     const button = this.$refs[item][0].querySelector('button');
      //     if (description.scrollHeight
      //       > description.offsetHeight) {
      //       button.removeAttribute('hidden');
      //     }
      //   });
      // },
      // showFullDescription(event) {
      //   event.target.previousElementSibling.classList.add('library-item__description--full');
      //   event.target.setAttribute('hidden', true);
      // },
      getSearchSuggestions() {
        const url = `${config.apiCMS.domain}search-suggestions?_limit=12`;

        return fetch(url)
          .then((response) => {
            if (!response.ok) {
              throw new Error('Network response was not OK');
            }
            return response.json();
          })
          .then((results) => {
            if (Array.isArray(results)) {
              this.searchSuggestions = results;
            } else {
              throw new Error('Response out of expected format');
            }
          })
          .catch((error) => {
            console.error('There has been a problem with your fetch operation:', error);
          });
      },
      getArticles(loadMore, search = false) {
        this.pending.articles = true;

        if (search) {
          this.pagination_offset = 0;
          this.pagination_limit = 15;
        }

        const url = !this.searchQuery
          ? `${config.apiCMS.domain}artigos?_limit=${this.pagination_limit}&_start=${this.pagination_offset}`
          : `${config.apiCMS.domain}artigos?_q=${this.searchQuery}&_limit=${this.pagination_limit}&_start=${this.pagination_offset}`;

        return fetch(url)
          .then((response) => {
            if (!response.ok) {
              throw new Error('Network response was not OK');
            }
            return response.json();
          })
          .then((response) => {
            const results = Array.isArray(response.results)
              ? response.results
              : response;

            this.has_more = response.hasMore ?? results.length === this.pagination_limit;

            if (loadMore) {
              this.articles = [...this.articles, ...results];
            } else {
              this.articles = results;
            }
          })
          .then(() => {
            if (this.has_more) {
              this.pagination_offset += this.pagination_limit;
            }
            if (search) {
              const results = document.querySelector('#js-search-results');
              if (results) {
                results.scrollIntoView({ behavior: 'smooth' });
              }
            }
          })
          .catch((error) => {
            console.error('There has been a problem with your fetch operation:', error);
          })
          .finally(() => {
            this.pending.articles = false;
          });
      },
    },
  });
}
