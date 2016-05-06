import React, { Component } from 'react'
import ReactDOM from 'react-dom'

import Player from './components/Player'
import QueryString from './utils/QueryString'

const style = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}

if (! QueryString.id) {
  console.warn(`You should pass the player.html iframe a url param 'id'.`)
}

const root = (
  <div style={style}>
    <Player
      id={QueryString.id || '0'}
    />
  </div>
)

ReactDOM.render(root, document.getElementById('react-root'))
