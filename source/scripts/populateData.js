
/* global Vue */
/* global Highcharts */
import config from './config';

if (window.location.href.indexOf('city') > -1) {
  window.$vue = new Vue({
    el: '#app',
    data: {
      localeId: window.location.search.split('id=')[1],
      locale: null,
    },
    computed: {
      loading() {
        return !this.locale;
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
    },
    methods: {
      async getData() {
        const response = await fetch(`${config.api.domain}data?locale_id=${this.localeId}&year=2018`);
        const json = await response.json();
        this.locale = json.locale;
      },

      //   data: [{
      //     name: 'Chrome',
      //     y: 61.41,
      //   }, {
      //     name: 'Internet Explorer',
      //     y: 11.84
      //   }, {
      //     name: 'Firefox',
      //     y: 10.85
      //   }, {
      //     name: 'Edge',
      //     y: 4.67
      //   }, {
      //     name: 'Safari',
      //     y: 4.18
      //   }, {
      //     name: 'Other',
      //     y: 7.05
      //   }]

      formatDataToPieCharts(items) {
        const data = [];
        items.data.forEach((item) => {
          data.push({
            name: item.description,
            y: Number(item.values.value_relative)
          });
        });
        return data;
      },

      formatDataToBarsCharts(items) {
        const data = [];
        items.data.forEach((item) => {
          data.push({
            name: item.description,
            data: [Number(item.values.value_relative)],
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
              shared: true,
              useHTML: true,
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
            series: [{
              data: this.formatDataToPieCharts(chart),
            }],
          });
        });
      },
    },
  });
}
