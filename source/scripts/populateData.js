/* global Vue */
/* global Highcharts */
import slugify from 'slugify';
import config from './config';
import startSearch from './search';

Highcharts.setOptions({
  lang: {
    printChart: 'Imprimir Gráfico',
    viewFullscreen: 'Ver em tela cheia',

    downloadPNG: 'Baixar PNG',
    downloadJPEG: 'Baixar JPG',
    downloadPDF: 'Baixar PDF',
    downloadSVG: 'Baixar SVG',
  },
});

if (window.location.href.indexOf('city') > -1) {
  window.$vuePopulateData = new Vue({
    el: '#app',
    data: {
      localeId: window.location.search.split('id=')[1],
      selectedArea: Number(window.location.search.split('area=')[1]) || 1,
      locale: null,
      apiUrl: config.api.domain,
      apiDocsUrl: config.api.docs,
    },
    computed: {
      loading() {
        return !this.locale;
      },
      indicatorsCount() {
        return this.locale.indicators.filter(
          indicator => indicator.area.id === this.selectedArea,
        ).length;
      },
      mapZoomLevel() {
        if (this.locale.type === 'country') {
          return 4;
        }
        if (this.locale.type === 'city') {
          return 14;
        }
        return 6;
      },
      barsHorizontalData() {
        const data = [];
        if (!this.loading) {
          this.locale.indicators.forEach((indicator) => {
            indicator.subindicators.forEach((subindicator) => {
              if (subindicator.data.length > 2 && subindicator.data.length <= 3) {
                const updatedSubindicator = subindicator;
                updatedSubindicator.indicatorId = indicator.id;
                data.push(updatedSubindicator);
              }
            });
          });
        }
        return data;
      },
      barsData() {
        const data = [];
        if (!this.loading) {
          this.locale.indicators.forEach((indicator) => {
            indicator.subindicators.forEach((subindicator) => {
              if (subindicator.data.length > 3) {
                const updatedSubindicator = subindicator;
                updatedSubindicator.indicatorId = indicator.id;
                data.push(updatedSubindicator);
              }
            });
          });
        }
        return data;
      },
    },
    created() {},
    async mounted() {
      await this.getData();
      await this.generateCharts();
      await this.changeTitle();
      startSearch();
    },
    methods: {
      changeTitle() {
        document.title = `Obeserva - ${this.locale.name}`;
      },
      slugify(string) {
        return slugify(string, { lower: true });
      },
      async print(divId) {
        const clone = document.querySelector(`#${divId}`).cloneNode(true);
        const elems = document.querySelectorAll('body *');
        Array.prototype.slice.call(elems).forEach((value) => {
          value.classList.add('hide');
        });
        document.body.appendChild(clone);
        await window.print();
        Array.prototype.slice.call(elems).forEach((value) => {
          value.classList.remove('hide');
        });
        clone.remove();
      },
      async getData() {
        const response = await fetch(`${config.api.domain}data?locale_id=${this.localeId}`);
        const json = await response.json();
        this.locale = json.locale;
      },

      formatDataToPieCharts(items) {
        const data = [];
        items.data.forEach((item) => {
          data.push({
            name: item.description,
            y: Number(item.values.value_relative)
              ? Number(item.values.value_relative)
              : Number(item.values.value_absolute),
          });
        });
        return data;
      },

      formatDataToBarsCharts(items) {
        const data = [];
        items.data.forEach((item) => {
          data.push({
            name: item.description,
            data: [Number(item.values.value_relative)
              ? Number(item.values.value_relative)
              : Number(item.values.value_absolute)],
          });
        });
        return data;
      },

      reflowCharts() {
        const details = document.querySelectorAll('.js-details-with-chart');

        details.forEach((detail) => {
          detail.addEventListener('transitionend', () => {
            Highcharts.charts.forEach((chart) => {
              if (chart) {
                chart.reflow();
              }
            });
          });
        });
      },
      generateCharts() {
        this.barsData.forEach((chart) => {
          Highcharts.chart(`bar-chart-${chart.indicatorId}-${chart.id}`, {
            chart: {
              type: 'column',
            },
            title: null,
            subtitle: null,
            xAxis: {
              gridLineWidth: 0,
              labels: {
                enabled: false,
              },
            },
            yAxis: {
              min: 0,
              title: {
                text: false,
              },
            },
            tooltip: {
              headerFormat: '',
            },
            plotOptions: {
              column: {
                pointPadding: 0.2,
                borderWidth: 0,
              },
            },
            series: this.formatDataToBarsCharts(chart),
          });
        });

        this.barsHorizontalData.forEach((chart) => {
          Highcharts.chart(`bar-chart-horizontal-${chart.indicatorId}-${chart.id}`, {
            chart: {
              type: 'bar',
            },
            title: null,
            subtitle: null,
            xAxis: {
              title: {
                text: null,
              },
              labels: {
                enabled: '',
              },
            },
            yAxis: {
              min: 0,
              title: {
                text: false,
              },
            },
            tooltip: {
              enabled: false,
            },
            plotOptions: {
              bar: {
                dataLabels: {
                  enabled: true,
                },
              },
            },
            series: this.formatDataToBarsCharts(chart),
          });
        });
      },
    },
  });
}
