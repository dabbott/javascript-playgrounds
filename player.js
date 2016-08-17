require('./styles/reset.css')

import React, { Component } from 'react'
import ReactDOM from 'react-dom'

import Player from './components/player/Player'
import { getHashString } from './utils/HashString'
import { prefix, prefixAndApply } from './utils/PrefixInlineStyles'
import VendorComponents from './components/player/VendorComponents'

const style = prefix({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  overflow: 'hidden',
})

const {
  id = '0',
  width = '210',
  platform = 'ios',
  scale = '1',
  assetRoot = '',
  vendorComponents = '[]'
} = getHashString()

const root = (
  <div style={style}>
    <Player
      id={id}
      width={parseFloat(width)}
      scale={parseFloat(scale)}
      platform={platform}
      assetRoot={assetRoot}
    />
  </div>
)

const mount = document.getElementById('react-root')

// Set mount node to flex in a vendor-prefixed way
prefixAndApply({ display: 'flex' }, mount)

// if we have vendor components, we need to pre-load those
// otherwise, we can just render normally
const components = JSON.parse(vendorComponents)
VendorComponents.load(components, () => ReactDOM.render(root, mount))
