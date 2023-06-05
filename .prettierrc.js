'use strict';

module.exports = {
  overrides: [
    {
      files: '*.{js,ts}',
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
