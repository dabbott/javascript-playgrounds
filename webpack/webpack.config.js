const path = require('path')
const webpack = require('webpack')

const DIRECTORY = path.dirname(__dirname)

module.exports = {
  devServer: {
    contentBase: DIRECTORY
  },
  entry: {
    index: path.join(DIRECTORY, 'index.js'),
    player: path.join(DIRECTORY, 'player.js'),
    vendor: ['react', 'react-dom'],
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
    filename: '[name]-bundle.js'
  },
  worker: {
    output: {
      filename: "babel-worker-bundle.js"
    }
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin("vendor", "vendor-bundle.js"),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin()
  ]
}
