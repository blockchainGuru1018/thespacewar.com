module.exports = {
    extends: [
        "eslint:recommended",
        "plugin:vue/recommended",
        "prettier",
        "prettier/vue",
    ],
    plugins: ["prettier", "vue"],
    rules: {
        "prettier/prettier": ["error", { endOfLine: "auto" }],
        node: 2,
        "vue/html-indent": [
            "error",
            4,
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
