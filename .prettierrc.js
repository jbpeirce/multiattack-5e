'use strict';

module.exports = {
  overrides: [
    {
      files: '*.{js,ts,hbs}',
      options: {
        singleQuote: true,
      },
      rules: {
        error: {
          endOfLine: 'auto',
        },
      },
    },
  ],
};
