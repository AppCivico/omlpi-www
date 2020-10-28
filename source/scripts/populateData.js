/* global Vue */
/* global Highcharts */

import slugify from 'slugify';
import config from './config';
import startSearch from './search';
import { formatterMixing } from './helpers';

Highcharts.setOptions({
  lang: {
    thousandsSep: '.',
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
    mixins: [formatterMixing],
    data: {
      localeId: window.location.search.split('id=')[1].split('&')[0],
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
            indicator.subindicators.filter((subindicator) => {
              if (subindicator.showAs === 'horizontalBarChart') {
                const updatedSubindicator = subindicator;
                updatedSubindicator.indicatorId = indicator.id;
                data.push(updatedSubindicator);
              }
              return true;
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
              if (subindicator.showAs === 'barsChart') {
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
      formatIndicatorHeaderValue(values, isPercentage) {
        if (values.value_relative === null && values.value_absolute === null) {
          return 'Não disponível';
        }
        if (values.value_relative) {
          return `${Number(values.value_relative).toLocaleString('pt-br')}${isPercentage ? '%' : ''}`;
        }
        if (values.value_absolute) {
          return Number(values.value_absolute).toLocaleString('pt-br');
        }
        return true;
      },
      showAsBigNumber(items) {
        if (items.every(item => item.is_big_number) && items.length <= 2) {
          return true;
        }
        // if (items.length <= 2) {
        //   return true;
        // }
        return false;
      },
      showAsHorizontalBarChart(items) {
        if (items.length === 3) {
          return true;
        }
        return false;
      },
      showAsBarChart(items) {
        if (items.some(item => !item.is_big_number) && items.length > 3) {
          return true;
        }
        // if (items.length > 3) {
        //   return true;
        // }
        return false;
      },
      changeTitle() {
        document.title = `Observa - ${this.locale.name}`;
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
        document.querySelector(`#${divId}`).scrollIntoView();
      },
      async getData() {
        const response = await fetch(`${config.api.domain}data?locale_id=${this.localeId}`);
        const json = await response.json();
        this.locale = this.formatLocale(json.locale);
        return true;
      },

      formatLocale(data) {
        // JSON.parse and stringify are being used
        // to deep clone a simple object
        const updatedLocale = JSON.parse(JSON.stringify(data));
        updatedLocale.indicators = [];

        data.indicators.forEach((indicator) => {
          const newIndicator = JSON.parse(JSON.stringify(indicator));
          const indicatorDescription = indicator.description;
          const indicatorYear = indicator.values.year;
          newIndicator.subindicators = [];


          indicator.subindicators.forEach((subindicator) => {
            const subindicatorData = subindicator.data
              .filter(item => item.values.year === indicatorYear);

            const updatedSubindicator = subindicator;
            updatedSubindicator.data = subindicatorData;
            updatedSubindicator.indicatorId = indicator.id;
            updatedSubindicator.indicatorDescription = indicatorDescription;

            if (subindicatorData.length > 0) {
              if (this.showAsBarChart(subindicatorData)) {
                updatedSubindicator.showAs = 'barsChart';
              } else if (this.showAsHorizontalBarChart(subindicatorData)) {
                updatedSubindicator.showAs = 'horizontalBarChart';
              } else {
                updatedSubindicator.showAs = 'bigNumber';
              }
              newIndicator.subindicators.push(updatedSubindicator);
            }
          });
          updatedLocale.indicators.push(newIndicator);
        });
        return updatedLocale;
      },

      formatDataToBarsCharts(items) {
        const data = [];
        items.data.forEach((item) => {
          data.push({
            name: item.description,
            is_null: item.values.value_relative === null && item.values.value_absolute === null,
            data: [item.values.value_relative !== null
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
            title: {
              text: chart.classification,
              style: {
                width: '100%',
                wordWrap: 'break-word',
              },
            },
            subtitle: {
              text: chart.indicatorDescription,
            },
            caption: {
              text: chart.data[0].values.year,
              y: 25,
              style: {
                color: '#a3a3a3',
                fontsize: '.88889rem',
              },
            },
            xAxis: {
              gridLineWidth: 0,
              labels: {
                enabled: false,
              },
            },
            yAxis: {
              min: 0,
              labels: {
                format: chart.data[0].values.value_relative,
              },
              title: {
                text: false,
              },
            },
            tooltip: {
              // eslint-disable-next-line object-shorthand, func-names
              formatter: function () {
                return chart.data[0].values.value_relative ? `${this.y}` : this.y;
              },
              headerFormat: '',
            },
            plotOptions: {
              column: {
                minPointLength: 3,
              },
              series: {
                borderWidth: 0,
                dataLabels: {
                  // eslint-disable-next-line object-shorthand, func-names
                  formatter: function () {
                    return this.series.userOptions.is_null ? 'Não disponível' : Number(this.y).toLocaleString('pt-br');
                  },
                  useHTML: true,
                  enabled: true,
                },
              },
            },
            exporting: {
              filename: `Observa_${this.locale.name}_Indicador_${chart.indicatorId}_${chart.classification}`,
            },
            series: this.formatDataToBarsCharts(chart),
          });
        });

        this.barsHorizontalData.forEach((chart) => {
          // if (chart.indicatorId === 311 && chart.id === 124) {
          //   console.log(document.querySelector('#bar-chart-horizontal-311-124'));
          // }
          Highcharts.chart(`bar-chart-horizontal-${chart.indicatorId}-${chart.id}`, {
            chart: {
              type: 'bar',
            },
            title: {
              text: chart.classification,
            },
            subtitle: {
              text: chart.indicatorDescription,
            },
            caption: {
              text: chart.data[0].values.year,
              y: 25,
              style: {
                color: '#a3a3a3',
                fontsize: '.88889rem',
              },
            },
            xAxis: {
              title: {
                text: null,
              },
              labels: {
                enabled: '',
              },
            },
            yAxis: {
              tickWidth: 0,
              type: 'logarithmic',
              title: {
                text: false,
              },
            },
            tooltip: {
              headerFormat: '',
            },
            plotOptions: {
              bar: {
                dataLabels: {
                  // eslint-disable-next-line object-shorthand, func-names
                  formatter: function () {
                    return this.series.userOptions.is_null ? 'Não disponível' : Number(this.y).toLocaleString('pt-br');
                  },
                  useHTML: true,
                  enabled: true,
                },
              },
            },
            exporting: {
              filename: `Observa_${this.locale.name}_Indicador_${chart.indicatorId}_${chart.classification}`,
            },
            series: this.formatDataToBarsCharts(chart),
          });
        });
        return true;
      },
    },
  });
}
