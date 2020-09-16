const path = require('path')
const webpack = require('webpack')

const DIRECTORY = path.dirname(__dirname)

const { version } = require('../package.json')

module.exports = {
  mode: 'production',
  entry: path.join(DIRECTORY, 'src', 'components', 'embed', 'Playground.tsx'),
  output: {
    path: path.join(DIRECTORY, 'dist'),
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
                declarationDir: '../dist',
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
