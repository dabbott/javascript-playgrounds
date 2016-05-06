const path = require('path')
const webpack = require('webpack')

const DIRECTORY = __dirname

module.exports = {
  devServer: {
    contentBase: DIRECTORY
  },
  entry: {
    index: path.join(DIRECTORY, 'index.js'),
    player: path.join(DIRECTORY, 'player.js'),
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: { cacheDirectory: true }
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.css$/,
        loader: "style-loader!css-loader"
      },
    ]
  },
  output: {
    path: path.join(DIRECTORY, 'dist'),
    filename: '[name].js'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin()
  ]
}
