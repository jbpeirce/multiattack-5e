'use strict';

module.exports = {
  plugins: ['prettier-plugin-ember-template-tag'],
  overrides: [
    {
      files: '*.{js,gjs,ts,gts,mjs,mts,cjs,cts,hbs}',
      options: {
        singleQuote: true,
        templateSingleQuote: false,
      },
      rules: {
        error: {
          endOfLine: 'auto',
        },
      },
    },
  ],
};
