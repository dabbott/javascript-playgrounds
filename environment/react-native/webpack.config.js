const path = require('path')
const webpack = require('webpack')

const DIRECTORY = path.resolve(__dirname, '..', '..')

module.exports = {
  entry: {
    index: path.join(DIRECTORY, 'environment', 'react-native', 'index.js'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
            },
          },
        ]
      },
    ],
  },
  externals: {
    webplayer: 'window.webplayer',
  },
  output: {
    filename: './build/react-native-environment-bundle.js',
  },
}
