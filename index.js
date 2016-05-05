import React, { Component } from 'react'
import ReactDOM from 'react-dom'

import Phone from './components/Phone'
import Player from './components/Player'

const style = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}

const root = (
  <div style={style}>
    <Player />
  </div>
)

ReactDOM.render(root, document.getElementById('react-root'))
