const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const testFolder = './tests/';
const glob = require('glob');

const entry = {
    legacyTest: path.join(__dirname, 'legacyTests', 'runAllLegacyTests.js')
};

const testFilePaths = glob.sync(path.join(__dirname, testFolder, '**/*Test.js'));
console.log('testFilePaths', testFilePaths);
for (const filePath of testFilePaths) {
    const name = filePath.split('/').pop().split('.').shift().split('Test').shift();
    entry[name] = filePath;
}

module.exports = {
    mode: 'development',
    entry,
    output: {
        filename: '[name].test.js',
        path: path.resolve(__dirname, 'build')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                query: {
                    presets: [
                        [
                            "@babel/preset-env",
                            {
                                "targets": {
                                    "browsers": [
                                        "> 5%"
                                    ]
                                }
                            }
                        ]
                    ],
                    plugins: [
                        '@babel/plugin-proposal-object-rest-spread',
                        '@babel/plugin-transform-async-to-generator'
                    ]
                }
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.scss$/,
                use: [
                    'vue-style-loader',
                    'css-loader',
                    'sass-loader'
                ]
            }
        ]
    },
    resolve: {
        alias: {
            vue: path.resolve(__dirname, 'node_modules/vue/dist/vue.common.js'),
            vuex: path.resolve(__dirname, 'node_modules/vuex/dist/vuex.common.js')
        }
    },
    plugins: [
        new VueLoaderPlugin()
    ]
};

