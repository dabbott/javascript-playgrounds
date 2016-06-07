require('./styles/reset.css')
require('./styles/index.css')

import React, { Component } from 'react'
import ReactDOM from 'react-dom'

import Workspace from './components/workspace/Workspace'
import QueryString from './utils/QueryString'
import DefaultCode from './constants/DefaultCode'

const style = {
  flex: '1 1 auto',
  display: 'flex',
  alignItems: 'stretch',
  minWidth: 0,
  minHeight: 0,
  overflow: 'hidden',
}

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

ReactDOM.render(root, document.getElementById('react-root'))
