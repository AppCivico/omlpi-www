function removeDiacritics(string) {
  return string.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

const formatterMixing = {
  methods: {
    formatIndicatorValue(values, isPercentage) {
      if (values.value_relative === null && values.value_absolute === null) {
        return '';
      }
      if (values.value_relative !== null) {
        return Math.round(values.value_relative) + (isPercentage ? '%' : '');
      }
      if (values.value_absolute !== null) {
        return Number(values.value_absolute).toLocaleString('pt-br');
      }
      return 'invalid indicator format';
    },
    formatSingleIndicatorValue(value, isPercentage) {
      if (value === null) {
        return 'Não disponível';
      }
      if (value !== null && isPercentage) {
        return `${Math.round(value)}% `;
      }
      if (value !== null && !isPercentage) {
        return Number(value).toLocaleString('pt-br');
      }
      return 'invalid indicator format';
    },
  },
};

// eslint-disable-next-line import/prefer-default-export
export { formatterMixing, removeDiacritics };
