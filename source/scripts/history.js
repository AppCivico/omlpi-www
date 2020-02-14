/* global Vue */
/* global Highcharts */

import Awesomplete from 'awesomplete';
import fuzzysort from 'fuzzysort';
import { removeDiacritics } from './helpers';
import config from './config';

if (document.querySelector('#app-history')) {
  window.$vueHistory = new Vue({
    el: '#app-history',
    data: {
      locales: null,
      locale: { historical: [{ indicators: [] }] },
      selectedArea: 3,
      selectedIndicator: { description: null },
      selectedSubindicator: {},
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
    watch: {
      locale(newLocale) {
        this.selectedIndicator = { ...newLocale.historical[0].indicators[0] };
        // if (this.selectedIndicator && this.selectedIndicator.subindicators) {
        //   this.selectedSubindicator = { ...this.selectedIndicator.subindicators[0] };
        // }
      },
    },
    async mounted() {
      await this.getLocales();
      await this.getLocale(this.localeId);
      await this.generateIndicatorChart();
    },
    methods: {
      getLocale(localeId) {
        this.loadingLocale = true;
        const url = `${config.api.domain}data/historical?locale_id=${localeId || 1}`;

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
          return;
        }
        return data.values.map(item => item.year);
      },
      formatDataToBarsCharts(items) {
        if (!items.values) {
          return;
        }

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
      generateIndicatorChart() {
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
      },
      generateSubindicatorChart() {
        Highcharts.chart('js-subindicators-chart', {
          chart: {
            type: 'bar',
          },
          title: {
            text: 'Historic World Population by Region',
          },
          subtitle: {
            text: 'Source: <a href="https://en.wikipedia.org/wiki/World_population">Wikipedia.org</a>',
          },
          xAxis: {
            categories: ['Africa', 'America', 'Asia', 'Europe', 'Oceania'],
            title: {
              text: null,
            },
          },
          yAxis: {
            min: 0,
            title: {
              text: 'Population (millions)',
              align: 'high',
            },
            labels: {
              overflow: 'justify',
            },
          },
          tooltip: {
            valueSuffix: ' millions',
          },
          plotOptions: {
            bar: {
              dataLabels: {
                enabled: true,
              },
            },
          },
          legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'top',
            x: -40,
            y: 80,
            floating: true,
            borderWidth: 1,
            backgroundColor:
            Highcharts.defaultOptions.legend.backgroundColor || '#FFFFFF',
            shadow: true,
          },
          credits: {
            enabled: false,
          },
          series: [{
            name: 'Year 1800',
            data: [107, 31, 635, 203, 2],
          }, {
            name: 'Year 1900',
            data: [133, 156, 947, 408, 6],
          }, {
            name: 'Year 2000',
            data: [814, 841, 3714, 727, 31],
          }, {
            name: 'Year 2016',
            data: [1216, 1001, 4436, 738, 40],
          }],
        });
      },
    },
  });
}
