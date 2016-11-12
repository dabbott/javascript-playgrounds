require('./styles/reset.css')
require('./styles/index.css')

import React, { Component } from 'react'
import ReactDOM from 'react-dom'

import Workspace from './components/workspace/Workspace'
import { getHashString, setHashString } from './utils/HashString'
import DefaultCode from './constants/DefaultCode'
import { prefix, prefixAndApply } from './utils/PrefixInlineStyles'

const style = prefix({
  flex: '1 1 auto',
  display: 'flex',
  alignItems: 'stretch',
  minWidth: 0,
  minHeight: 0,
  overflow: 'hidden',
})

let {
  title = '',
  code = DefaultCode,
  files = '[]',
  entry = 'index.js',
  initialTab = 'index.js',
  platform = 'ios',
  width = '210',
  scale = '1',
  assetRoot = '',
  vendorComponents = '[]',
} = getHashString()

const parsedFiles = JSON.parse(files)
let fileMap

if (parsedFiles.length > 0) {

  // Build a map of {filename => code}
  fileMap = parsedFiles.reduce((fileMap, [filename, code]) => {
    fileMap[filename] = code
    return fileMap
  }, {})

  // If entry file is invalid, choose the first file
  if (!fileMap.hasOwnProperty(entry)) {
    entry = parsedFiles[0][0]
  }
} else {
  // If no files are given, use the code param
  fileMap = {[entry]: code}
}

if (!fileMap.hasOwnProperty(initialTab)) {
  initialTab = entry
}

const root = (
  <div style={style}>
    <Workspace
      title={title}
      files={fileMap}
      entry={entry}
      initialTab={initialTab}
      platform={platform}
      assetRoot={assetRoot}
      scale={parseFloat(scale)}
      width={parseFloat(width)}
      vendorComponents={JSON.parse(vendorComponents)}
      onChange={setHashString}
    />
  </div>
)

const mount = document.getElementById('react-root')

// Set mount node to flex in a vendor-prefixed way
prefixAndApply({ display: 'flex' }, mount)

ReactDOM.render(root, mount)
