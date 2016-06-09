require('./styles/reset.css')

import React, { Component } from 'react'
import ReactDOM from 'react-dom'

import Player from './components/player/Player'
import QueryString from './utils/QueryString'
import { prefix, prefixAndApply } from './utils/PrefixInlineStyles'

const style = prefix({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  overflow: 'hidden',
})

if (! QueryString.id) {
  console.warn(`You should pass the player.html iframe a url param 'id'.`)
}

const root = (
  <div style={style}>
    <Player
      id={QueryString.id || '0'}
      width={parseInt(QueryString.width) || 210}
      platform={QueryString.platform || 'ios'}
    />
  </div>
)

const mount = document.getElementById('react-root')

// Set mount node to flex in a vendor-prefixed way
prefixAndApply({ display: 'flex' }, mount)

ReactDOM.render(root, mount)
