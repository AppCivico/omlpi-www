function removeDiacritics(string) {
  return string.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// eslint-disable-next-line import/prefer-default-export
export { removeDiacritics };
