const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin'); //installed via npm
const webpack = require('webpack'); //to access built-in plugins
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
mode: 'development',
devtool: 'nosources-cheap-module-source-map',
  entry: ['./menu.js', './sass/menu-button.scss'],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'menu.bundle.js'
  },
  plugins: [
    new HtmlWebpackPlugin({template: './src/index.html'}),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: "[name].css",
      chunkFilename: "[id].css",
    }),
  ],
module: {
  rules: [
    {
      test: /\.s[ac]ss$/i,
      use: [
        {
          loader: MiniCssExtractPlugin.loader
        },
        //'style-loader',
        'css-loader',
        'sass-loader'
      ],
    },
  ]}
};
