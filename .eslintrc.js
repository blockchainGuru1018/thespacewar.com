const ERROR = 2,
  WARNING = 1;

module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:vue/recommended",
    "prettier",
    "prettier/vue",
  ],
  plugins: ["prettier", "vue"],
  rules: {
    "max-len": [
      WARNING,
      {
        code: 80,
        tabWidth: 2,
        ignoreComments: true,
        ignoreTrailingComments: true,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
      },
    ],
    "prettier/prettier": [
      "error",
      { endOfLine: "auto", printWidth: 80, tabWidth: 2 },
    ],
    "vue/html-indent": [
      "error",
      2,
      {
        attribute: 1,
        baseIndent: 1,
        closeBracket: 0,
        alignAttributesVertically: true,
        ignores: [],
      },
    ],
    "vue/attribute-hyphenation": 2,
  },
  env: {
    commonjs: true,
    jest: true,
    node: true,
  },
  settings: {
    "import/resolver": {
      webpack: {
        config: "webpack.config.js",
      },
    },
  },
};
