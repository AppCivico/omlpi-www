/* global Vue */
import Swal from 'sweetalert2/dist/sweetalert2';
import config from './config';

if (window.location.href.indexOf('planos-pela-primeira-infancia') > -1) {
  window.$vuePlans = new Vue({
    el: '#app',
    data: {
      infographic: null,
      locales: null,
      selectedLocale: null,
      selectedLocaleId: null,
      relatedLocales: null,
      capital: null,
      storageDomain: config.storage.domain,
      formLoading: false,
      form: {
        fileName: null,
        file: null,
        name: null,
        message: null,
        email: null,
      },
    },
    computed: {
      loading() {
        return !this.locale;
      },
    },
    async mounted() {
      await this.getInfoGraphic();
    },
    methods: {
      updateFile(event) {
        this.form.file = [event.target.files[0]];
        this.form.fileName = this.form.file[0].name;
      },
      resetForm() {
        document.querySelector('#plan').value = '';
        this.form = {
          fileName: null,
          file: null,
          name: null,
          message: null,
          email: null,
        };
      },
      sendPlan() {
        const data = new FormData();
        data.append('file', this.form.file[0]);
        data.append('name', this.form.name);
        data.append('message', this.form.message);
        data.append('email', this.form.email);
        this.formLoading = true;

        fetch(`${config.api.domain}upload_plan`, {
          method: 'POST',
          body: data,
        })
          .then((response) => {
            if (response.status === 200) {
              Swal.fire({
                title: 'Tudo Certo!',
                text: 'Seu plano foi enviado para avaliação',
                icon: 'success',
                confirmButtonText: 'Fechar',
              })
                .then(this.formLoading = false)
                .then(this.resetForm());
            } else {
              Swal.fire({
                title: 'Ops! Algo deu errado',
                text: 'Tivemos um problema no envio, por favor, tente novamente',
                icon: 'error',
                confirmButtonText: 'Fechar',
              })
                .then(this.formLoading = false);
            }
          });
      },
      setMapDestak(locale) {
        const map = document.querySelector('.js-brazil-map');

        if (map.querySelector('.active')) {
          map.querySelector('.active').classList.remove('active');
        }

        map.querySelector(`.${locale}`).classList.add('active');
      },
      setLocale(localeId) {
        this.resetSelectedLocales();
        this.selectedLocale = this.locales.find(locale => locale.id === localeId);

        if (this.selectedLocale.type === 'state') {
          const cities = this.locales.filter(
            locale => locale.type === 'city' && locale.state === this.selectedLocale.state,
          );
          this.capital = this.locales.find(
            locale => locale.type === 'city' && locale.state === this.selectedLocale.state && locale.is_capital,
          );
          this.relatedLocales = this.getSectionedLocales(cities)
            .sort((a, b) => ((a.title > b.title) ? 1 : -1));

          this.setMapDestak(this.selectedLocale.state);
        }

        if (this.selectedLocale.type === 'region') {
          const states = this.locales.filter(
            locale => locale.type === 'state' && locale.region === this.selectedLocale.region,
          );
          this.relatedLocales = this.getSectionedLocales(states)
            .sort((a, b) => ((a.title > b.title) ? 1 : -1));

          this.setMapDestak(this.selectedLocale.region);
        }

        if (this.selectedLocale.type === 'city') {
          this.setMapDestak(this.selectedLocale.state);
        }
      },
      getSectionedLocales(locales) {
        return Object.values(
          locales.reduce((acc, locale) => {
            const firstLetter = locale.name[0].toLocaleUpperCase();
            if (!acc[firstLetter]) {
              acc[firstLetter] = { title: firstLetter, data: [locale] };
            } else {
              acc[firstLetter].data.push(locale);
            }
            return acc;
          }, {}),
        );
      },
      resetSelectedLocales() {
        this.selectedLocale = null;
        this.selectedLocaleId = null;
        this.relatedLocales = null;
        this.capital = null;
      },
      getInfoGraphic() {
        fetch(`${config.apiCMS.domain}infograficos/1`)
          .then(response => response.json())
          .then((response) => {
            this.infographic = {};
            if (response.small && response.small.url) {
              this.infographic.small = `${config.storage.domain}${response.small.url}`;
            }

            if (response.big && response.big.url) {
              this.infographic.big = `${config.storage.domain}${response.big.url}`;
            }

            if (response.pdf && response.pdf.url) {
              this.infographic.url = `${config.storage.domain}${response.pdf.url}`;
            }
          });
      },
    },
  });
}
