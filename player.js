import React, { Component } from 'react'
import ReactDOM from 'react-dom'

import Player from './components/Player'
import QueryString from './utils/QueryString'

console.log('qs', QueryString)

const style = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}

const root = (
  <div style={style}>
    <Player
      id={QueryString.id}
    />
  </div>
)

ReactDOM.render(root, document.getElementById('react-root'))
