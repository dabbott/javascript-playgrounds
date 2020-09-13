import React from 'react'
import ReactDOM from 'react-dom'

import Sandbox from './components/player/Sandbox'
import { getHashString } from './utils/HashString'
import { prefix, prefixAndApply } from './utils/Styles'
import { appendCSS } from './utils/CSS'
import VendorComponents from './components/player/VendorComponents'
import type { IEnvironment } from './environments/IEnvironment'

const style = prefix({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  overflow: 'hidden',
  flex: '1 1 auto',
})

const {
  id = '0',
  assetRoot = '',
  vendorComponents = '[]',
  styleSheet = 'reset',
  css = '',
  statusBarHeight = '0',
  statusBarColor = 'black',
  prelude = '',
  sharedEnvironment = 'true',
} = getHashString()

if (styleSheet === 'reset') {
  require('./styles/reset.css')
}

require('./styles/player.css')

if (css) {
  appendCSS(css)
}

const mount = document.getElementById('player-root') as HTMLDivElement

// Set mount node to flex in a vendor-prefixed way
prefixAndApply({ display: 'flex' }, mount)

const modules = JSON.parse(vendorComponents)

import('./environments/react-native-environment')
  .then((module) => module.default)
  .then((environment: IEnvironment) => {
    return environment.initialize().then(() => {
      VendorComponents.load(modules, () => {
        const root = (
          <div style={style}>
            <Sandbox
              environment={environment}
              id={id}
              assetRoot={assetRoot}
              prelude={prelude}
              statusBarHeight={parseFloat(statusBarHeight)}
              statusBarColor={statusBarColor}
              sharedEnvironment={sharedEnvironment === 'true'}
            />
          </div>
        )

        ReactDOM.render(root, mount)
      })
    })
  })
