const webpack = require("webpack");
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const srcDir = '../src/chrome';
const outDir = '../dist/chrome';

module.exports = {
    devtool: 'inline-source-map',
    entry: {
        main: path.join(__dirname, srcDir, 'main.ts')
    },
    output: {
        path: path.join(__dirname, outDir),
        filename: '[name].js'
    },
    optimization: {
        splitChunks: {
            name: 'vendor',
            chunks: "initial"
        }
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
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
};
