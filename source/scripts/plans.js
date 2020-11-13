/* global Vue */
/* global Highcharts */

import Swal from 'sweetalert2/dist/sweetalert2';
import config from './config';

if (window.location.href.indexOf('planos-pela-primeira-infancia') > -1) {
  window.$vuePlans = new Vue({
    el: '#app',
    data: {
      infographic: null,
      plansList: null,
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
      await this.getPlansList();
      await this.generateChart();
    },
    methods: {
      generateChart() {
        // Prepare demo data
        // Data is joined to map using value of 'hc-key' property by default.
        // See API docs for 'joinBy' for more info on linking data and map.
        const data = Highcharts.geojson(Highcharts.maps['countries/br/br-all']);

        data.forEach((item, index) => {
          const newItem = item;
          newItem.drilldown = item.properties['hc-key'];
          newItem.value = index; // Non-random bogus data
        });
        // Create the chart
        Highcharts.mapChart('map', {
          chart: {
            // map: 'countries/br/br-all',
            backgroundColor: 'rgba(0, 0, 0, 0)',
            events: {
              // eslint-disable-next-line object-shorthand, func-names
              drilldown: function (e) {
                // console.log(e.point.drilldown)
                console.log('DRIIIILDOWN')
                if (!e.seriesOptions) {
                  // console.log('this?', this)
                  const chart = this;
                  // Handle error, the timeout is cleared on success
                  const fail = setTimeout(() => {
                    if (!Highcharts.maps[mapKey]) {
                      chart.showLoading('<i class="icon-frown"></i> Failed loading ' + e.point.name);
                      fail = setTimeout(function () {
                        chart.hideLoading();
                      }, 1000);
                    }
                  }, 3000);

                  // Show the spinner
                  chart.showLoading('carregando...'); // Font Awesome spinner

                  // Load the drilldown map
                  fetch('/maps/br-mg.json')
                    .then(response => response.json())
                    .then((Ndata) => {
                      // console.log(data)

                      // Set a non-random bogus value
                      Ndata.mapData.forEach((item, i) => {
                        const newI = i;
                        newI.value = i;
                        // console.log(i)
                      });

                      chart.hideLoading();

                      // Hide loading and add series
                      clearTimeout(fail);

                      chart.addSeriesAsDrilldown(e.point, {
                        name: e.point.name,
                        data: Ndata.mapData,
                        dataLabels: {
                          enabled: false,
                          format: '{point.name}',
                        },
                      });
                    });
                }

                this.setTitle(null, { text: e.point.name });
              },
              drillup: function () {
                console.log('DRIIIILUUUP')
              }
            }
          },
          title: {
            text: ''
          },

          subtitle: {
            text: ''
          },

          mapNavigation: {
            enabled: true,
            buttonOptions: {
              verticalAlign: 'bottom'
            }
          },

          colorAxis: {
            min: 0
          },

          series: [{
            joinBy: ['hc-key', 'code'],
            data: data,
            name: 'Random data',
            states: {
              hover: {
                color: '#BADA55'
              }
            },
            dataLabels: {
              enabled: true,
              format: '{point.name}'
            }
          }]
        });

      },
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
          })
          .catch(() => {
            Swal.fire({
              title: 'Ops! Algo deu errado',
              text: 'Tivemos um problema no envio, por favor, tente novamente',
              icon: 'error',
              confirmButtonText: 'Fechar',
            })
              .then(this.formLoading = false);
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
            locale => locale.type === 'city' && locale.state === this.selectedLocale.state && locale.plan,
          );
          this.capital = this.locales.find(
            locale => locale.type === 'city' && locale.state === this.selectedLocale.state && locale.is_capital,
          );
          this.relatedLocales = this.getSectionedLocales(cities)
            .sort((a, b) => ((a.title > b.title) ? 1 : -1));

          // this.setMapDestak(this.selectedLocale.state);
        }

        if (this.selectedLocale.type === 'region') {
          const states = this.locales.filter(
            locale => locale.type === 'state' && locale.region === this.selectedLocale.region,
          );
          this.relatedLocales = this.getSectionedLocales(states)
            .sort((a, b) => ((a.title > b.title) ? 1 : -1));

          // this.setMapDestak(this.selectedLocale.region);
        }

        if (this.selectedLocale.type === 'city') {
          // this.setMapDestak(this.selectedLocale.state);
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
            this.infographic.title = response.title;
            this.infographic.description = response.description;

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
      getPlansList() {
        fetch(`${config.apiCMS.domain}listaplanos/1`)
          .then(response => response.json())
          .then((response) => {
            this.plansList = response;
          });
      },
    },
  });
}
