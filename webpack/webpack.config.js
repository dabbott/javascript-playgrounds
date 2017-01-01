const path = require('path')
const webpack = require('webpack')

const DIRECTORY = path.dirname(__dirname)

module.exports = {
  devServer: {
    contentBase: DIRECTORY
  },
  entry: {
    index: path.join(DIRECTORY, 'src', 'index.js'),
    player: path.join(DIRECTORY, 'src', 'player', 'index.js'),
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
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
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
    filename: 'build/[name]-bundle.js'
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      options: {
        worker: {
          output: {
            filename: '[hash]-worker-bundle.js',
          }
        },
      },
    }),
  ],
  performance: {
    hints: false,
  },
}
