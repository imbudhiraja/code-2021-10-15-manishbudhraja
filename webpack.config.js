const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');

const {
  name: NAME, version: VERSION,
} = require('./package.json');

const PORT = 3000;

const getDevTool = (env) => (env.NODE_ENV === 'development' ? 'cheap-eval-source-map' : 'source-map');

const getPlugins = (env) => {
  const plugins = [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      filename: './index.html',
      inject: 'body',
      template: path.resolve('./index.html'),
      title: NAME,
    }),
    new webpack.EnvironmentPlugin({ TARGET_ENV: env.TARGET_ENV }),
    new MiniCssExtractPlugin({
      filename: `${NAME}-${VERSION}.css`,
      linkType: 'text/css',
    }),
  ];

  if (env.NODE_ENV !== 'development') {
    plugins.push(new CompressionWebpackPlugin());
  }

  return plugins;
};

module.exports = (env) => ({
  devServer: {
    historyApiFallback: true,
    host: 'localhost',
    open: env.TARGET_ENV === 'development',
    port: PORT,
  },
  devtool: getDevTool(env.TARGET_ENV),
  entry: [
    '@babel/polyfill',
    './index.js',
  ],
  module: {
    rules: [
      {
        exclude: /node_modules/,
        loader: 'babel-loader',
        test: /\.(js|jsx)$/i,
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.(png|jpe?g|gif|svg|otf|ttf|woff|woff2|eot)$/i,
        use: [
          {
            loader: 'url-loader',
            options: { limit: 100000000 },
          },
        ],
      },
    ],
  },
  optimization: {
    minimize: env.NODE_ENV === 'development',
    minimizer: [new TerserWebpackPlugin({ test: /\.js(\?.*)?$/i })],
  },
  output: {
    chunkFilename: '[id].js',
    filename: `${NAME}-${VERSION}.js`,
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },
  performance: {
    hints: env.NODE_ENV === 'production' ? 'warning' : false,
    maxAssetSize: 2048000,
    maxEntrypointSize: 2048000,
  },
  plugins: getPlugins(env),
  profile: env.NODE_ENV === 'development',
  resolve: { extensions: ['.js', '.jsx', '.scss'] },
});
