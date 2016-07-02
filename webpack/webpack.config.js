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
    devtools: path.join(DIRECTORY, 'devtools.js'),
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
  resolve: {
    alias: {
      react: path.join(DIRECTORY, 'node_modules/react'),
    },
  },
  node: {
    // From babel-standalone:
    // Mock Node.js modules that Babel require()s but that we don't
    // particularly care about.
    fs: 'empty',
    module: 'empty',
    net: 'empty'
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
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      filename: "vendor-bundle.js",
      chunks: ["vendor"],
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin()
  ]
}
