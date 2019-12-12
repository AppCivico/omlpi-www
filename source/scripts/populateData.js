
/* global Vue */
/* global Highcharts */
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
  window.$vue = new Vue({
    el: '#app',
    data: {
      selectedArea: 2,
      localeId: window.location.search.split('id=')[1],
      locale: null,
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
      pieData() {
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
      startSearch();
    },
    methods: {
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

      getBarChartTitles(items) {
        return items.data.map(item => item.description);
      },

      reflowCharts() {
        const details = document.querySelectorAll('.js-details-with-chart');

        details.forEach((detail) => {
          detail.addEventListener('transitionend', () => {
            Highcharts.charts.forEach(chart => chart.reflow());
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
              categories: this.getBarChartTitles(chart),
              crosshair: true,
            },
            yAxis: {
              min: 0,
              title: {
                text: false,
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
            exporting: {
              buttons: {
                contextButton: {
                  // text: 'Download',
                  menuItems: ['downloadPNG', 'downloadJPG', 'downloadPDF', 'downloadSVG'],
                },
              },
            },
            series: this.formatDataToBarsCharts(chart),
          });
        });

        this.pieData.forEach((chart) => {
          Highcharts.chart(`pie-chart-${chart.indicatorId}-${chart.id}`, {
            chart: {
              plotBackgroundColor: null,
              plotBorderWidth: null,
              plotShadow: false,
              type: 'pie',
            },
            title: false,
            tooltip: {
              pointFormat: '{point.name}: <b>{point.percentage:.1f}%</b>',
            },
            plotOptions: {
              pie: {
                allowPointSelect: false,
                cursor: 'pointer',
                dataLabels: {
                  enabled: false,
                },
                showInLegend: true,
              },
            },
            exporting: {
              buttons: {
                contextButton: {
                  // text: 'Download',
                  menuItems: ['downloadPNG', 'downloadJPG', 'downloadPDF', 'downloadSVG'],
                },
              },
            },
            series: [{
              data: this.formatDataToPieCharts(chart),
            }],
          });
        });
      },
    },
  });
}
