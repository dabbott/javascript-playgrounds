import React, { Component } from 'react'
import ReactDOM from 'react-dom'

import Sandbox from './components/player/Sandbox'
import { getHashString } from './utils/HashString'
import { prefix, prefixAndApply } from './utils/PrefixInlineStyles'
import { appendCSS } from './utils/Styles'
import VendorComponents from './components/player/VendorComponents'

const style = prefix({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  overflow: 'hidden',
})

const {
  id = '0',
  assetRoot = '',
  vendorComponents = '[]',
  styleSheet = 'reset',
  css = '',
} = getHashString()

if (styleSheet === 'reset') {
  require('./styles/reset.css')
}

require('./styles/player.css')

if (css) {
  appendCSS(css)
}

const root = (
  <div style={style}>
    <Sandbox
      id={id}
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
