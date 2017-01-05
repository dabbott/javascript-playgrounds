
const path = require('path')
const fs = require('fs')

const DEFAULTS = {
  scripts: [],
  vendorComponents: [],
}

const readConfigFile = (environment) => {
  const configFilePath = path.resolve(__dirname, '..', 'presets', `${environment}.js`)

  return require(configFilePath)
}

module.exports = (environment) => {
  const config = environment
    ? readConfigFile(environment)
    : {}

  return Object.assign(
    {},
    DEFAULTS,
    config
  )
}
