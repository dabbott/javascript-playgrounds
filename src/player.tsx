import React, { CSSProperties } from 'react'
import ReactDOM from 'react-dom'

import Sandbox from './components/player/Sandbox'
import { getHashString } from './utils/HashString'
import { prefixAndApply, prefixObject } from './utils/Styles'
import { appendCSS } from './utils/CSS'
import VendorComponents, {
  ExternalModule,
} from './components/player/VendorComponents'
import type { IEnvironment } from './environments/IEnvironment'
import JavaScriptEnvironment from './environments/javascript-environment'

const {
  preset = 'react-native',
  id = '0',
  assetRoot = '',
  detectedModules: rawDetectedModules = '[]',
  modules: rawModules = '[]',
  styleSheet = 'reset',
  css = '',
  statusBarHeight = '0',
  statusBarColor = 'black',
  prelude = '',
  sharedEnvironment = 'true',
  styles = '{}',
} = getHashString()

if (styleSheet === 'reset') {
  require('./styles/reset.css')
}

require('./styles/player.css')

if (css) {
  appendCSS(css)
}

const mount = document.getElementById('player-root') as HTMLDivElement

export type PlayerStyles = {
  playerRoot: CSSProperties
  playerWrapper: CSSProperties
  playerApp: CSSProperties
}

const parsedStyles: PlayerStyles = prefixObject(
  Object.assign(
    {
      playerRoot: { display: 'flex' },
      playerWrapper: {
        flex: '1 1 auto',
        alignSelf: 'stretch',
        width: '100%',
        height: '100%',
        display: 'flex',
      },
      playerApp: {
        flex: '1 1 auto',
        alignSelf: 'stretch',
        width: '100%',
        height: '100%',
        display: 'flex',
      },
    },
    JSON.parse(styles)
  )
)

prefixAndApply(parsedStyles.playerRoot, mount)

const modules: ExternalModule[] = JSON.parse(rawModules)
const detectedModules: string[] = JSON.parse(rawDetectedModules)

const asyncEnvironment: Promise<IEnvironment> =
  preset === 'javascript'
    ? Promise.resolve(JavaScriptEnvironment)
    : import('./environments/' + preset + '-environment').then(
        (module) => module.default
      )

asyncEnvironment.then((environment: IEnvironment) => {
  return environment.initialize().then(() => {
    const normalizedModules = modules
      .map(VendorComponents.normalizeExternalModule)
      .filter(({ name }) => !environment.hasModule(name))

    // Only download detected modules that aren't also listed as vendor components
    const detectedModulesToDownload = detectedModules
      .filter((name) => !normalizedModules.find((m) => m.name === name))
      .map(VendorComponents.normalizeExternalModule)

    VendorComponents.load(
      [...normalizedModules, ...detectedModulesToDownload],
      () => {
        const root = (
          <Sandbox
            environment={environment}
            id={id}
            assetRoot={assetRoot}
            styles={parsedStyles}
            prelude={prelude}
            statusBarHeight={parseFloat(statusBarHeight)}
            statusBarColor={statusBarColor}
            sharedEnvironment={sharedEnvironment === 'true'}
          />
        )

        ReactDOM.render(root, mount)
      }
    )
  })
})
