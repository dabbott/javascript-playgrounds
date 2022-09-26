const webpack = require('webpack')
const { merge } = require('webpack-merge')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const paths = {
  root: path.join(__dirname, '..'),
  get src() {
    return path.join(this.root, 'src')
  },
  get index() {
    return path.join(this.src, 'index.tsx')
  },
  get player() {
    return path.join(this.src, 'player.tsx')
  },
  get public() {
    return path.join(this.root, 'public')
  },
  get htmlTemplate() {
    return path.join(this.root, 'webpack/index.ejs')
  },
}

const common = merge({
  entry: {
    index: paths.index,
    player: paths.player,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: ['ts-loader'],
        exclude: /node_modules/,
      },
      {
        test: /\.jsx?$/,
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
        test: /-worker\.ts/,
        use: [
          {
            loader: 'worker-loader',
            options: { filename: '[name]-bundle.js', esModule: true },
          },
          'ts-loader',
        ],
      },
      {
        test: /-worker\.js/,
        loader: 'worker-loader',
        options: { filename: '[name]-bundle.js', esModule: false },
      },
      {
        test: /\.svg$/i,
        loader: 'file-loader',
      },
    ],
  },
  output: {
    path: paths.public,
    filename: '[name]-bundle.js',
    globalObject: 'this',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    alias: {
      '@babel/plugin-transform-unicode-regex': path.join(__dirname, 'empty.js'),
    },
    // From babel-standalone:
    // Mock Node.js modules that Babel require()s but that we don't
    // particularly care about.
    fallback: {
      fs: false,
      module: false,
      net: false,
      assert: require.resolve('assert/'),
      buffer: require.resolve('buffer/'),
      path: require.resolve('path-browserify'),
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'JavaScript Playgrounds',
      filename: 'index.html',
      template: paths.htmlTemplate,
      minify: false,
      chunks: ['index'],
    }),
    new HtmlWebpackPlugin({
      title: 'Player',
      filename: 'player.html',
      template: paths.htmlTemplate,
      minify: false,
      chunks: ['player'],
    }),
    new webpack.ProvidePlugin({
      process: require.resolve('process'),
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
  stats: {
    children: true,
  },
})

module.exports = ({ production = false }) => {
  const mode = production ? 'production' : 'development'

  const defines = new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(mode),
  })

  if (mode === 'production') {
    return merge(common, {
      mode,
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
      mode,
      devtool: 'source-map',
      plugins: [defines],
    })
  }
}
