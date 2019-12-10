import Awesomplete from 'awesomplete';
import fuzzysort from 'fuzzysort';
import Swal from 'sweetalert2/dist/sweetalert2';
import config from './config';

export default function startPlansSearch() {
  const regionInput = document.querySelector('#js-plan-search');

  function removeDiacritics(string) {
    return string.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  async function getList() {
    const response = await fetch(`${config.apiCMS.domain}locales`);
    const json = await response.json();
    return json;
  }

  async function mountList() {
    const list = await getList();

    regionInput.removeAttribute('disabled');
    regionInput.removeAttribute('aria-busy');

    const regionNames = list.map(region => ({
      label: `${region.name}:${region.state ? 'city' : 'state'}`,
      value: region.id,
    }));

    const awesomplete = new Awesomplete(regionInput, {
      item: (suggestion) => {
        const html = document.createElement('li');
        const type = suggestion.label.split(':')[1];
        const typeString = 'Município';
        // if (type === 'state') {
        //   typeString = 'Estado';
        // }
        // if (type === 'country') {
        //   typeString = 'País';
        // }
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
    /* eslint-disable no-unused-vars */
    regionInput.addEventListener('awesomplete-selectcomplete', (event) => {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Área em desenvolvimento :(',
      });
      // window.location.href = `/city?id=${event.text.value}`;
    }, false);
  }

  if (regionInput) {
    mountList();
    watchSelection();
  }
}
