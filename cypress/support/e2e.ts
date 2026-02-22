Cypress.on('uncaught:exception', (err, _runnable) => {
  if (err.message.includes('Hydration failed')) {
    return false;
  }
});
