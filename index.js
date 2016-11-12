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

const {
  title = '',
  code = DefaultCode,
  files = '[]',
  initialTab = 'index.js',
  platform = 'ios',
  width = '210',
  scale = '1',
  assetRoot = '',
  vendorComponents = '[]',
} = getHashString()

const parsedFiles = JSON.parse(files)
const normalizedFiles = parsedFiles.length === 0 ? [['index.js', code]] : parsedFiles

const root = (
  <div style={style}>
    <Workspace
      title={title}
      files={normalizedFiles}
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
