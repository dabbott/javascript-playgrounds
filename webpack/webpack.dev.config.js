const path = require('path')
const webpack = require('webpack')

const options = require('./webpack.config.js')

options.devtool = "source-map"

options.plugins.unshift(
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('development')
  })
)

module.exports = options
