/* global Vue */
/* global Highcharts */

import config from './config';

if (document.querySelector('#app-history')) {
  window.$vueHistory = new Vue({
    el: '#app-history',
    data: {
      locales: null,
      locale: null,
      selectedArea: 3,
      selectedIndicator: 5,
      loadingLocale: false,
      additionalLocaleId: null,
      triggerAnimation: true,
      storageDomain: config.storage.domain,
      areas: [
        {
          id: 1,
          name: 'Assistência Social',
          class: 'social-care',
        },
        {
          id: 2,
          name: 'Educação',
          class: 'education',
        },
        {
          id: 3,
          name: 'Saúde',
          class: 'health',
        },
      ],
    },
    computed: {
      loading() {
        return !this.locale;
      },
      localeId() {
        return new URL(window.location.href).searchParams.get('location_id');
      },
      indicators() {
        return this.locale.historical[0].indicators.filter(
          item => item.area.id === this.selectedArea,
        );
      },
    },
    async mounted() {
      await this.getLocales();
      await this.getLocale(this.localeId);
      await this.generateCharts();
    },
    methods: {
      getLocale(localeId) {
        this.loadingLocale = true;
        const url = `${config.api.domain}data/historical?locale_id=${localeId || 2803609}`;

        fetch(url)
          .then(response => response.json())
          .then((response) => {
            this.locale = response;
            return true;
          })
          .then(() => {
            this.loadingLocale = false;
            return true;
          });
      },
      getLocales() {
        this.loadingLocale = true;
        fetch(`${config.api.domain}locales`)
          .then(response => response.json())
          .then((response) => {
            this.locales = response.locales;
            return true;
          })
          .then(() => {
            this.loadingLocales = false;
            return true;
          });
      },
      getYears(data) {
        return data.values.map(item => item.year);
      },
      formatDataToBarsCharts(items) {
        const data = [];
        items.values.forEach((item) => {
          data.push({
            name: item.year,
            data: [Number(item.value_relative)
              ? Number(item.value_relative)
              : Number(item.value_absolute)],
          });
        });
        return data;
      },
      generateCharts() {
        Highcharts.chart('js-history', {
          chart: {
            type: 'column',
          },
          title: {
            text: this.selectedIndicator.description,
          },
          subtitle: {
            text: null,
          },
          xAxis: {
            categories: this.getYears(this.selectedIndicator),
            crosshair: true,
          },
          yAxis: {
            min: 0,
            title: {
              text: null,
            },
          },
          tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr>'
            + '<td style="padding:0"><b>{point.y}</b></td></tr>',
            footerFormat: '</table>',
            useHTML: true,
          },
          plotOptions: {
            column: {
              pointPadding: 0.2,
              borderWidth: 0,
            },
          },
          series: this.formatDataToBarsCharts(this.selectedIndicator),
        });
        // end
      },
    },
  });
}
