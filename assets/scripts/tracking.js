import config from './config';

function getPrivacyPolicy() {
  return fetch(`${config.apiCMS.domain}privacy-policy`)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not OK');
      }

      return true;
    })
    .catch((error) => {
      console.error('There has been a problem with your fetch operation:', error);
      return false;
    });
}

export default (async () => {
  const hasPrivacyPolicy = await getPrivacyPolicy();
  if (hasPrivacyPolicy) {
    const provacyPolicyMenuItem = document.querySelectorAll('[data-endpoint="privacy-policy"]') || [];

    provacyPolicyMenuItem.forEach((element) => {
      if (element.hasAttribute('hidden')) {
        element.removeAttribute('hidden');
      }
    });
  }
});
