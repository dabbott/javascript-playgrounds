const path = require('path')
const webpack = require('webpack')

const config = require('./webpack.config.js')
const options = config[0]

options.devtool = "source-map"

options.plugins.unshift(
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('development')
  })
)

module.exports = config
