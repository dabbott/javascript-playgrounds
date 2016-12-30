#!/usr/bin/env node

// console.log('args', process.argv)

const path = require('path')
const fs = require('fs')
const execSync = require('child_process').execSync

const options = require('./options')

const files = options.args.map(filename => [
  path.basename(filename),
  fs.readFileSync(filename, {encoding: 'utf8'}),
])

const vendorComponents = options.vendor.length > 0
  ? options.vendor.map(component => component.split(','))
  : undefined

const params = {
  files,
  vendorComponents,
  title: options.title,
  panes: options.panes,
}

const paramSchema = {

  // Plain text
  title: 'text',
  transpilerTitle: 'text',
  code: 'text',
  entry: 'text',
  initialTab: 'text',
  platform: 'text',
  fullscreen: 'text',
  width: 'text',
  scale: 'text',
  assetRoot: 'text',
  workspaceCSS: 'text',
  playerCSS: 'text',
  playerStyleSheet: 'text',

  // JSON-encoded
  files: 'json',
  vendorComponents: 'json',
  panes: 'json',
  styles: 'json',
}

const createUrlParams = (params) => {
  return Object.keys(params).map((key) => {
    return `${key}=${encodeURIComponent(params[key])}`
  }).join('&')
}

const encodeParams = (params) => {
  return Object.keys(params).reduce((acc, key) => {
    const value = params[key]

    if (typeof value === 'undefined') return acc

    acc[key] = paramSchema[key] === 'json'
      ? JSON.stringify(value)
      : value

    return acc
  }, {})
}

const WEB_PLAYER_VERSION = '1.9.1'
const WEB_PLAYER_URL = options.baseUrl || `http://cdn.rawgit.com/dabbott/react-native-web-player/gh-v${WEB_PLAYER_VERSION}/index.html`

const encodedParams = encodeParams(params)
const hash = `#${createUrlParams(encodedParams)}`
const url = `${WEB_PLAYER_URL}${hash}`

if (options.displayOnly) {
  console.log('opening', url)
} else {
  execSync(`open "${url}"`)
}
