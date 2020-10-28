/* global Vue */
/* global Highcharts */

import Awesomplete from 'awesomplete';
import fuzzysort from 'fuzzysort';
import { removeDiacritics, formatterMixing } from './helpers';
import config from './config';

if (document.querySelector('#app-history')) {
  window.$vueHistory = new Vue({
    el: '#app-history',
    mixins: [formatterMixing],
    data: {
      locales: null,
      locale: { historical: [{ indicators: [] }] },
      selectedArea: Number(new URL(window.location.href).searchParams.get('area')) || 3,
      selectedIndicator: { description: null },
      selectedSubindicator: {},
      loadingLocale: false,
      additionalLocaleId: null,
      triggerAnimation: true,
      storageDomain: config.storage.domain,
      firstChartPrint: 1,
      apiUrl: config.api.domain,
      apiDocsUrl: config.api.docs,
      localeId: new URL(window.location.href).searchParams.get('location_id'),
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
      indicators() {
        return this.locale.historical[0].indicators.filter(
          item => item.area.id === this.selectedArea,
        );
      },
      emptyIndicator() {
        return this.locale?.historical[0].indicators?.length === 0
          || this.selectedIndicator?.subindicators?.length === 0
          || Object.keys(this.selectedIndicator).length === 0;
      },
    },
    watch: {
      selectedArea() {
        if (this.indicators.length > 0) {
          this.selectedIndicator = { ...this.indicators[0] };
        }

        if (this.selectedIndicator?.subindicators?.length > 0) {
          this.selectedSubindicator = { ...this.selectedIndicator.subindicators[0] };
        }

        if (this.selectedSubindicator) {
          this.selectedYear = this.selectedSubindicator?.data?.[0]?.values[0]?.year;
        }

        this.updateUrlParams('area', this.selectedArea);

        this.generateIndicatorChart();
      },
      locale() {
        if (this.indicators.length > 0) {
          this.selectedIndicator = { ...this.indicators[0] };
        }

        if (this.selectedIndicator?.subindicators?.length > 0) {
          this.selectedSubindicator = { ...this.selectedIndicator.subindicators[0] };
        }

        if (Object.entries(this.selectedSubindicator).length !== 0
            && this.selectedSubindicator.constructor === Object) {
          this.selectedYear = this.selectedSubindicator?.data?.[0]?.values[0]?.year;
        }

        if (this.locale.historical) {
          const newId = this.locale.historical?.[0].id;
          this.updateUrlParams('location_id', newId);
          this.localeId = newId;
        }

        document.querySelector('#myLocation').value = this.locale.historical[0].name;
        this.generateIndicatorChart();
      },
      selectedIndicator() {
        if (this.selectedIndicator?.subindicators?.length > 0) {
          this.selectedSubindicator = { ...this.selectedIndicator.subindicators[0] };
        }

        if (this.selectedSubindicator) {
          this.selectedYear = this.selectedSubindicator?.data?.[0]?.values?.[0]?.year;
        }
        this.generateIndicatorChart();
        this.generateSubindicatorChart();
      },
      selectedSubindicator() {
        this.generateSubindicatorChart();
      },
    },
    async mounted() {
      await this.getLocales();
      await this.getLocale(this.localeId);
      // await this.generateIndicatorChart();
      // await this.generateSubindicatorChart();
    },
    methods: {
      updateUrlParams(param, value) {
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.set(param, value);
        const newRelativePathQuery = `${window.location.pathname}?${searchParams.toString()}`;
        window.history.pushState(null, '', newRelativePathQuery);
      },
      getLocale(localeId) {
        this.loadingLocale = true;
        const url = `${config.api.domain}data/historical?locale_id=${localeId || localeId === 0 ? localeId : 1}`;
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
            this.locales = response.locales.map(region => ({
              label: `${region.name}:${region.type}`,
              value: region.id,
            }));
            return true;
          })
          .then(() => {
            const regionInput = document.querySelector('#myLocation');
            const awesomplete = new Awesomplete(regionInput, {
              item: (suggestion) => {
                const html = document.createElement('li');
                const type = suggestion.label.split(':')[1];
                let typeString;
                if (type === 'city') {
                  typeString = 'Município';
                }
                if (type === 'state') {
                  typeString = 'Estado';
                }
                if (type === 'region') {
                  typeString = 'Região';
                }
                if (type === 'country') {
                  typeString = 'País';
                }
                html.setAttribute('role', 'option');
                html.setAttribute('class', `awesomplete__${type}`);
                html.insertAdjacentHTML('beforeend',
                  `<span>${suggestion.label.split(':')[0]}<small>${typeString}</small></span>`);
                return html;
              },
              nChars: 1,
              maxItems: 5,
              autoFirst: true,
              filter(text, input) {
                return fuzzysort.single(removeDiacritics(input), removeDiacritics(text.label.split(':')[0]));
              },
              replace(suggestion) {
                [this.input.value] = [suggestion.label.split(':')[0]];
              },
            });
            awesomplete.list = this.locales;
            this.watchSelection();
          })
          .then(() => {
            this.loadingLocales = false;
            return true;
          });
      },
      watchSelection() {
        const regionInput = document.querySelector('#myLocation');
        regionInput.addEventListener('awesomplete-selectcomplete', (event) => {
          this.getLocale(event.text.value);
        }, false);
      },
      getYears(data) {
        if (!data.values) {
          return false;
        }
        return data.values.map(item => item.year);
      },
      formatSubindicatorYears(data) {
        if (!data) {
          return false;
        }
        return data[0].values.map(internItem => internItem.year);
      },
      formatDataToSubindicatorsChart(items) {
        if (!items || !items.values) {
          return false;
        }

        const data = [];
        items.forEach((item) => {
          data.push({
            name: item.description,
            data: item.values.map(internItem => (internItem.value_relative !== null
              ? Number(internItem.value_relative)
              : Number(internItem.value_absolute))),
          });
        });
        return data;
      },
      formatDataToBarsCharts(items) {
        if (!items.values) {
          return false;
        }

        const data = [];
        items.values.forEach((item) => {
          data.push({
            name: item.year,
            data: [item.value_relative !== null
              ? Number(item.value_relative)
              : Number(item.value_absolute)],
          });
        });
        return data.reverse();
      },
      generateIndicatorChart() {
        if (!this.selectedIndicator.id) {
          return false;
        }

        const indicatorChart = Highcharts.chart('js-history', {
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
            gridLineWidth: 0,
            labels: {
              enabled: false,
            },
          },
          yAxis: {
            min: 0,
            labels: {
              format: this.selectedIndicator.values[0].value_relative ? '{value}%' : '{value}',
            },
            title: {
              text: null,
            },
          },
          tooltip: {
            /* eslint-disable object-shorthand, func-names, camelcase */
            formatter: function () {
              return window.$vueHistory.selectedIndicator.values[0].value_relative
                ? `${Math.round(Number(this.y))}%`
                : Number(this.y).toLocaleString('pt-BR');
            },
            headerFormat: '',
          },
          plotOptions: {
            column: {
              pointPadding: 0.2,
              borderWidth: 0,
            },
          },
          exporting: {
            filename: `Observa_${this.locale.historical[0].name}_Indicador_${this.selectedIndicator.id}_Série_Histórica`,
          },
          series: this.formatDataToBarsCharts(this.selectedIndicator),
        });

        if (this.indicators.length === 0) {
          indicatorChart.destroy();
        }

        return true;
      },

      generateSubindicatorChart() {
        if (!this.selectedIndicator.id) {
          return false;
        }
        const subIndicatorChart = Highcharts.chart('js-subindicators-chart', {
          chart: {
            type: 'bar',
          },
          title: {
            text: this.selectedSubindicator.classification,
          },
          subtitle: {
            text: this.selectedIndicator.description,
          },
          xAxis: {
            categories: this.formatSubindicatorYears(this.selectedSubindicator.data),
            // categories: ['2018', '2019'],
            title: {
              text: null,
            },
          },
          yAxis: {
            min: 0,
            title: {
              text: null,
              align: 'high',
            },
            labels: {
              format: this.selectedSubindicator.data?.[0].values[0].value_relative ? '{value}%' : '{value}',
              overflow: 'justify',
            },
          },
          tooltip: {
            // eslint-disable-next-line object-shorthand, func-names
            formatter: function () {
              return window.$vueHistory.selectedSubindicator.data?.[0].values[0].value_relative
                ? `${Math.round(Number(this.y))}%`
                : Number(this.y).toLocaleString('pt-BR');
            },
            valueSuffix: null,
          },
          plotOptions: {
            bar: {
              dataLabels: {
                enabled: true,
                formatter: function () {
                  return window.$vueHistory.selectedSubindicator.data?.[0].values[0].value_relative
                    ? `${Math.round(Number(this.y))}%`
                    : Number(this.y).toLocaleString('pt-BR');
                },
              },
            },
          },
          credits: {
            enabled: false,
          },
          exporting: {
            filename: `Observa_${this.locale.historical[0].name}_Indicador_${this.selectedIndicator.id}_Desagregador_${
              this.selectedSubindicator.id}_Série_Histórica`,
          },
          series: this.formatDataToSubindicatorsChart(this.selectedSubindicator.data),
        });
        if (this.indicators.length === 0) {
          subIndicatorChart.destroy();
        }

        return true;
      },
    },
  });
}
