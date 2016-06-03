require('./styles/reset.css')

import React, { Component } from 'react'
import ReactDOM from 'react-dom'

import Player from './components/player/Player'
import QueryString from './utils/QueryString'

const style = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  overflow: 'hidden',
}

if (! QueryString.id) {
  console.warn(`You should pass the player.html iframe a url param 'id'.`)
}

const root = (
  <div style={style}>
    <Player
      id={QueryString.id || '0'}
      width={parseInt(QueryString.width) || 210}
    />
  </div>
)

ReactDOM.render(root, document.getElementById('react-root'))
