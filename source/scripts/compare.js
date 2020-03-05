/* global Vue */
/* global Highcharts */

import Awesomplete from 'awesomplete';
import fuzzysort from 'fuzzysort';
import { removeDiacritics } from './helpers';
import config from './config';

if (document.querySelector('#app-compare')) {
  window.$vueCompare = new Vue({
    el: '#app-compare',
    data: {
      locales_list: null,
      locales: { comparison: [{ indicators: [] }] },
      selectedArea: 3,
      selectedIndicator: { description: null },
      selectedSubindicator: {},
      selectedYear: null,
      loadingLocale: false,
      additionalLocaleId: null,
      triggerAnimation: true,
      storageDomain: config.storage.domain,
      firstChartPrint: 1,
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
      locale() {
        return this.locales.comparison[this.locales.comparison.length - 1];
      },
      localesWithIndicator() {
        return this.locales.comparison.filter(
          item => item.indicators.some(indicator => indicator.id === this.selectedIndicator.id),
        );
      },
      localesWithSubindicator() {
        return this.locales.comparison.filter(
          item => item.indicators.forEach(indicator => indicator.subindicators)
            .some(indicator => indicator.id === this.selectedIndicator.id),
        );
      },
      localeId() {
        return new URL(window.location.href).searchParams.get('location_id') || 5200050;
      },
      indicators() {
        return this.locale.indicators.filter(
          item => item.area.id === this.selectedArea,
        );
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
          this.selectedYear = this.selectedSubindicator?.data[0]?.values[0]?.year;
        }
      },
      locale() {
        if (this.indicators?.length > 0) {
          this.selectedIndicator = { ...this.indicators[0] };
        }

        if (this.selectedIndicator?.subindicators?.length > 0) {
          this.selectedSubindicator = { ...this.selectedIndicator.subindicators[0] };
        }

        if (Object.entries(this.selectedSubindicator)?.length !== 0
            && this.selectedSubindicator.constructor === Object) {
          this.selectedYear = this.selectedSubindicator?.data[0]?.values[0]?.year;
        }

        if (this.firstChartPrint) {
          document.querySelector('#myLocation').value = this.locale.name;
          this.generateIndicatorChart();
        }
      },
      selectedIndicator() {
        if (this.selectedIndicator?.subindicators?.length > 0) {
          this.selectedSubindicator = { ...this.selectedIndicator.subindicators[0] };
        }

        if (this.selectedSubindicator) {
          this.selectedYear = this.selectedSubindicator?.data[0]?.values[0]?.year;
        }
      },
      selectedSubindicator() {
        if (this.selectedSubindicator) {
          this.selectedYear = this.selectedSubindicator?.data[0]?.values[0]?.year;
        }
        if (this.firstChartPrint) {
          this.generateSubindicatorChart();
        }

        this.firstChartPrint = 0;
      },
    },
    async mounted() {
      await this.getLocales();
      await this.getLocale(this.localeId);
      // await this.generateIndicatorChart();
      // await this.generateSubindicatorChart();
    },
    methods: {
      getLocale(localeId) {
        this.loadingLocale = true;
        const url = `${config.api.domain}data/compare?locale_id=${localeId || config.fisrtCityId}`;
        fetch(url)
          .then(response => response.json())
          .then((response) => {
            this.locales = response;
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
            this.locales_list = response.locales.map(region => ({
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
                  return false;
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
            awesomplete.list = this.locales_list;
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
      getYears() {
        if (this.localesWithIndicator.length === 0) {
          return false;
        }

        return this.locale.indicators.filter(
          indicator => indicator.id === this.selectedIndicator.id,
        )[0].values.map(item => item.year);
      },
      formatCategories(data) {
        if (!data) {
          return false;
        }
        return data.map(internItem => internItem.description);
      },

      formatDataToSubindicatorsChart(items) {
        if (!items || !items.values) {
          return false;
        }

        const allData = [];
        let data = [];
        const descriptions = [];
        this.locales.comparison.forEach((comparison) => {
          const cityName = comparison.name;
          comparison.indicators.forEach((indicator) => {
            if (indicator.id === this.selectedIndicator.id) {
              indicator.subindicators.forEach((sub) => {
                if (sub.classification === this.selectedSubindicator.classification) {
                  sub.data.forEach((subData) => {
                    const description = { ...subData.description };
                    if (subData.values) {
                      subData.values.forEach((value) => {
                        if (value.year === Number(this.selectedYear)) {
                          descriptions.push(description);
                          data.push(value.value_relative
                            ? Number(value.value_relative)
                            : Number(value.value_absolute));
                        }
                      });
                    }
                  });
                }
              });
            }
          });
          if (data.length !== 0) {
            allData.push({
              name: cityName,
              data,
            });
            data = [];
          }
        });
        return allData;
      },


      formatDataToBarsCharts() {
        if (!this.localesWithIndicator) {
          return false;
        }

        const data = [];
        const dataValues = [];

        this.localesWithIndicator.forEach((item) => {
          item.indicators.filter(indicator => indicator.id === this.selectedIndicator.id)
            .forEach(locale => locale.values.forEach((i) => {
              if (i.value_relative) {
                dataValues.push(Number(i.value_relative));
              } else {
                dataValues.push(Number(i.value_absolute));
              }
            }));
        });

        this.localesWithIndicator.forEach((item) => {
          data.push({
            name: item.name,
            data: item.indicators.filter(indicator => indicator.id === this.selectedIndicator.id)
              .map(locale => locale.values.map((i) => {
                if (i.value_relative) {
                  return Number(i.value_relative);
                }
                return Number(i.value_absolute);
              }))[0],
          });
        });

        return data;
      },
      generateIndicatorChart() {
        return Highcharts.chart('js-history', {
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
            categories: this.getYears(this.selectedIndicator.id),
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
          series: this.formatDataToBarsCharts(this.locales),
        });
      },
      generateSubindicatorChart() {
        return Highcharts.chart('js-subindicators-chart', {
          chart: {
            type: 'column',
          },
          title: {
            text: this.selectedSubindicator.classification,
          },
          subtitle: {
            text: null,
          },
          xAxis: {
            categories: this.formatCategories(this.selectedSubindicator.data),
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
              overflow: 'justify',
            },
          },
          tooltip: {
            valueSuffix: null,
          },
          plotOptions: {
            bar: {
              dataLabels: {
                enabled: true,
              },
            },
          },
          credits: {
            enabled: false,
          },
          series: this.formatDataToSubindicatorsChart(this.selectedSubindicator.data),
        });
      },
    },
  });
}
