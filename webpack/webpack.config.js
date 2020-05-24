const webpack = require('webpack')
const merge = require('webpack-merge')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const paths = {
  root: path.join(__dirname, '..'),
  get index() {
    return path.join(this.root, 'index.js')
  },
  get player() {
    return path.join(this.root, 'player.js')
  },
  get public() {
    return path.join(this.root, 'public')
  },
}

const common = merge({
  devServer: {
    contentBase: paths.public,
  },
  entry: {
    index: paths.index,
    player: paths.player,
  },
  module: {
    rules: [
      {
        test: /\.js/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /-worker\.js/,
        loader: 'worker-loader',
        options: { name: '[name]-bundle.js' },
      },
    ],
  },
  node: {
    // From babel-standalone:
    // Mock Node.js modules that Babel require()s but that we don't
    // particularly care about.
    fs: 'empty',
    module: 'empty',
    net: 'empty',
  },
  output: {
    path: paths.public,
    filename: '[name]-bundle.js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'React Native Web Player',
      filename: 'index.html',
      template: 'index.ejs',
      minify: false,
      chunks: ['index'],
    }),
    new HtmlWebpackPlugin({
      title: 'Player',
      filename: 'player.html',
      template: 'index.ejs',
      minify: false,
      chunks: ['player'],
    }),
  ],
})

module.exports = ({ production } = {}) => {
  const defines = new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(
      production ? 'production' : 'development'
    ),
  })

  if (production) {
    return merge(common, {
      mode: 'production',
      plugins: [defines],
      optimization: {
        splitChunks: {
          name: false,
          chunks: 'all',
        },
      },
    })
  } else {
    return merge(common, {
      mode: 'development',
      devtool: 'source-map',
      plugins: [defines],
    })
  }
}
