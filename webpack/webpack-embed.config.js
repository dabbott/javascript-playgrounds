const path = require('path')
const webpack = require('webpack')

const { version } = require('../package.json')

const paths = {
  root: path.dirname(__dirname),
  get dist() {
    return path.join(this.root, 'dist')
  },
  get playground() {
    return path.join(this.root, 'src', 'components', 'embed', 'Playground.tsx')
  },
}

module.exports = {
  mode: 'production',
  entry: paths.playground,
  output: {
    path: path.dist,
    filename: 'javascript-playgrounds.js',
    library: 'javascript-playgrounds',
    libraryTarget: 'umd',
    globalObject: 'this',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              compilerOptions: {
                declaration: true,
                declarationDir: paths.dist,
              },
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  externals: {
    react: {
      root: 'React',
      commonjs2: 'react',
      commonjs: 'react',
      amd: 'react',
    },
    'react-dom': {
      root: 'ReactDOM',
      commonjs2: 'react-dom',
      commonjs: 'react-dom',
      amd: 'react-dom',
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
      VERSION: JSON.stringify(version),
    }),
  ],
}
