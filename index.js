require('./reset.css')
require('./index.css')

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
}

const root = (
  <div style={style}>
    <Workspace
      title={QueryString.title || 'Live React Native Editor'}
      value={QueryString.code || DefaultCode}
    />
  </div>
)

ReactDOM.render(root, document.getElementById('react-root'))
