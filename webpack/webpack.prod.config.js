const path = require('path')
const webpack = require('webpack')

const options = require('./webpack.config.js')

options.plugins.unshift(
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('production')
  })
)

options.plugins.push(
  new webpack.optimize.UglifyJsPlugin({
    output: {
      comments: false,
    },
    compress: {
      dead_code: true,
      drop_console: true,
      screw_ie8: true,
      warnings: true,
    }
  })
)

module.exports = options
