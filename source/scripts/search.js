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
    const regionNames = list.map(region => ({
      label: region.name,
      value: region.id,
      type: region.type,
    }));

    const awesomplete = new Awesomplete(regionInput, {
      nChars: 1,
      maxItems: 5,
      autoFirst: true,
      filter(text, input) {
        return fuzzysort.single(removeDiacritics(input), removeDiacritics(text.label));
      },
      replace(suggestion) {
        this.input.value = suggestion.label;
      },
    });
    awesomplete.list = regionNames;
  }

  mountList();
}
