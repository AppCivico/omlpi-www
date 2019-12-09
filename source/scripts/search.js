import Awesomplete from 'awesomplete';
import fuzzysort from 'fuzzysort';
import config from './config';

export default function startSearch() {
  const regionInput = document.querySelector('#js-region-input');

  function removeDiacritics(string) {
    return string.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  async function getList() {
    const response = await fetch(`${config.api.domain}locales`);
    const json = await response.json();
    return json.locales;
  }

  async function mountList() {
    const list = await getList();

    regionInput.removeAttribute('disabled');
    regionInput.removeAttribute('aria-busy');

    const regionNames = list.map(region => ({
      label: `${region.name}:${region.type}`,
      value: region.id,
    }));

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
    awesomplete.list = regionNames;
  }

  function watchSelection() {
    regionInput.addEventListener('awesomplete-selectcomplete', (event) => {
      window.location.href = `/city?id=${event.text.value}`;
    }, false);
  }

  if (regionInput) {
    mountList();
    watchSelection();
  }
}
