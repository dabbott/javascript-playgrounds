#!/usr/bin/env node

// console.log('args', process.argv)

const path = require('path')
const fs = require('fs')
const execSync = require('child_process').execSync

const options = require('./options')
const getConfig = require('./config')

const config = getConfig(options.preset)

const files = options.args.map(filename => [
  path.basename(filename),
  fs.readFileSync(filename, {encoding: 'utf8'}),
])

const remoteScriptMap = {
  react: 'https://unpkg.com/react@15.4.1/dist/react.min.js',
  'react-dom': 'https://unpkg.com/react-dom@15.4.1/dist/react-dom.min.js',
  'react-native': 'https://unpkg.com/react-native-web@0.0.56/dist/ReactNative.js',
  redux: 'https://unpkg.com/redux/dist/redux.js',
  framer: 'https://cdn.rawgit.com/dabbott/95e54f6f8505b95d998976f3bd550ea1/raw/d0675f183a01ea07297580ed303b48b9a057bf6d/Framer.js',
}

const unpkgify = name => (
  remoteScriptMap[name]
    ? remoteScriptMap[name]
    : `https://unpkg.com/${name}`
)

const vendorComponents = options.vendor.length > 0
  ? options.vendor
      .map(component => component.split(','))
      .map(component => (
        component.length === 1
          ? [component[0], unpkgify(component[0])]
          : component)
      )
  : undefined

const combinedScripts = [...config.scripts, ...options.script]
const scripts = combinedScripts.length > 0
  ? combinedScripts
    .map(script => (
      remoteScriptMap[script]
        ? remoteScriptMap[script]
        : script)
    )
  : undefined

const params = {
  files,
  vendorComponents,
  scripts,
  title: options.title,
  panes: options.panes,
  environment: options.environment || config.environment || undefined,
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
  environment: 'text',

  // JSON-encoded
  files: 'json',
  vendorComponents: 'json',
  scripts: 'json',
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
  if (options.json) {
    console.log('opening', WEB_PLAYER_URL, 'with params', params)
  } else {
    console.log('opening', url)
  }
} else {
  execSync(`open "${url}"`)
}
