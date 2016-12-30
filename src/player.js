import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { getUniversalState } from 'react-html-document'

import Sandbox from './components/player/Sandbox'
import { prefix, prefixAndApply } from './utils/PrefixInlineStyles'
import { appendCSS } from './utils/Styles'
import VendorComponents from './utils/VendorComponents'

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
} = getUniversalState()

if (styleSheet === 'reset') {
  require('../styles/reset.css')
}

require('../styles/player.css')

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

// Preload vendor components
VendorComponents.load(vendorComponents, () => ReactDOM.render(root, mount))
