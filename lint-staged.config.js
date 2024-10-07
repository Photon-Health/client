module.exports = {
  '**/*.{ts,tsx}': [(files) => `nx affected --target=typecheck --files=${files.join(',')}`],
  '**/*.{js,ts,jsx,tsx,json}': [
    (_files) => `nx format:check --uncommitted`,
    (files) => `nx affected:lint --files=${files.join(',')}`
  ]
};
