module.exports = {
    extends: [
        'eslint:recommended',
        'plugin:vue/recommended'
    ],
    rules: {
        "node": true,
        "vue/html-indent": ["error", 4, {
            "attribute": 1,
            "baseIndent": 1,
            "closeBracket": 0,
            "alignAttributesVertically": true,
            "ignores": []
        }]
    },
    'env': {
        'commonjs': true,
        'jest': true,
        'node': true
    }
};