const path = require('path')
const webpack = require('webpack')

const config = require('./webpack.config.js')
const options = config[0]

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

module.exports = config
