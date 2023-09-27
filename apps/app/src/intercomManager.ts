export const bootIntercom = (userName = '', userEmail = '', orgId = '') => {
  if (window.Intercom) {
    window.Intercom('boot', {
      api_base: 'https://api-iam.intercom.io',
      app_id: 'uqg0xvmw',
      name: userName,
      email: userEmail,
      org_id: orgId
    });
  }
};
