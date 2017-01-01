const path = require('path')

const DIRECTORY = path.resolve(__dirname, '..', '..')

module.exports = {
  entry: {
    index: path.resolve(DIRECTORY, 'environment', 'framer', 'index.js'),
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
    filename: './build/framer-environment-bundle.js',
  },
  performance: {
    hints: false,
  },
}
