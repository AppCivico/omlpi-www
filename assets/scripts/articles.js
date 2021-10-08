/* global Vue */
import config from './config';

if (window.location.href.indexOf('biblioteca') > -1) {
  window.$vueArticles = new Vue({
    el: '#app',
    data: {
      currentVideo: '',
      articles: null,
      searchQuery: null,
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
      // await this.putHasmoreButtons();
    },
    methods: {
      toggleModal(youtubeUrl = '') {
        let func = '';
        if (youtubeUrl) {
          const re = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(\S+)?$/i;
          const videoId = (youtubeUrl.match(re) || [])[5] || '';
          const embedUrl = videoId
            ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&amp;showinfo=0&enablejsapi=1`
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
      getArticles(loadMore, search = false) {
        if (search) {
          this.pagination_offset = 0;
          this.pagination_limit = 15;
        }

        let url = `${config.apiCMS.domain}artigos?_limit=${this.pagination_limit}&_offset=${this.pagination_offset}`;

        if (this.searchQuery) {
          url = `${config.apiCMS.domain}artigos?_q=${this.searchQuery}&_limit=${this.pagination_limit}&_offset=${this.pagination_offset}`;
        }

        return fetch(url)
          .then((response) => response.json())
          .then((response) => {
            if (loadMore) {
              this.articles = [...this.articles, ...response.results];
            } else {
              this.articles = response.results;
            }
            this.has_more = response.hasMore;
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
          });
      },
    },
  });
}
