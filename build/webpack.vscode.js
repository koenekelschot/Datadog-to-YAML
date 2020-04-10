const webpack = require("webpack");
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const srcDir = '../src/vscode';
const outDir = '../dist/vscode';

module.exports = {
    devtool: 'source-map',
    target: 'node',
    entry: {
        extension: path.join(__dirname, srcDir, 'extension.ts')
    },
    output: {
        path: path.join(__dirname, outDir),
        filename: '[name].js',
        libraryTarget: 'commonjs2',
        devtoolModuleFilenameTemplate: '../[resource-path]'
    },
    externals: {
        vscode: 'commonjs vscode'
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: 'ts-loader'
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin([
            {
                from: '*', 
                to: path.join(__dirname, outDir), 
                ignore: ['*.ts']
            }
        ],
        { 
            context: path.join(__dirname, srcDir) 
        })
    ]
}
