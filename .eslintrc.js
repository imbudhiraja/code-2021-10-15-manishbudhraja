module.exports = {
  extends: 'imbudhiraja/react',
  rules: {
    'max-lines': ['error', {
      max: 1000, skipBlankLines: true, skipComments: true,
    }],
    'react/forbid-foreign-prop-types': 'off',
    'react/jsx-props-no-spreading': 'off',
  },
};
