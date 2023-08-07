/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  target: 'node',
  externals: [nodeExternals()], // removes node_modules from your final bundle
  entry: './build/src/backend/src/index.js', // make sure this matches the main root of your code
  output: {
    path: path.join(__dirname, 'dist'), // this can be any path and directory you want
    filename: 'index.js',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'esbuild-loader',
        exclude: [/node_modules/],
        options: { loader: 'ts', target: 'es2015' },
      },
      {
        test: /\.js$/,
        loader: 'esbuild-loader',
        exclude: [/node_modules/],
        options: { loader: 'js', target: 'es2015' },
      },
    ],
  },
  optimization: {
    minimize: true, // enabling this reduces file size and readability
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.FLUENTFFMPEG_COV': false,
    }),
  ],
};
