require('./styles/reset.css')
require('./styles/index.css')

import React, { Component } from 'react'
import ReactDOM from 'react-dom'

import Workspace from './components/workspace/Workspace'
import QueryString from './utils/QueryString'
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
  showHeader = "true",
  title = 'React Native Web Player',
  code = DefaultCode,
} = QueryString

const root = (
  <div style={style}>
    <Workspace
      showHeader={showHeader !== "false"}
      title={title}
      value={code}
    />
  </div>
)

const mount = document.getElementById('react-root')

// Set mount node to flex in a vendor-prefixed way
prefixAndApply({ display: 'flex' }, mount)

ReactDOM.render(root, mount)
