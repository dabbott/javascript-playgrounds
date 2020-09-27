import type { CSSProperties } from 'react'
import type {
  EnvironmentOptions,
  IEnvironment,
} from './environments/IEnvironment'
import JavaScriptEnvironment from './environments/javascript-environment'
import { appendCSS } from './utils/CSS'
import { getHashString } from './utils/HashString'
import { prefixObject } from './utils/Styles'

const {
  environmentName = 'react-native',
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

const asyncEnvironment: Promise<IEnvironment> =
  environmentName === 'javascript'
    ? Promise.resolve(JavaScriptEnvironment)
    : import('./environments/' + environmentName + '-environment').then(
        (module) => module.default
      )

asyncEnvironment.then((environment: IEnvironment) => {
  const options: EnvironmentOptions = {
    id,
    assetRoot,
    prelude,
    styles: parsedStyles,
    statusBarHeight: parseFloat(statusBarHeight),
    statusBarColor: statusBarColor,
    sharedEnvironment: sharedEnvironment === 'true',
    modules: JSON.parse(rawModules),
    detectedModules: JSON.parse(rawDetectedModules),
  }

  return environment.initialize(options).then(handleEnvironmentReady)
})

// Notify the parent that we're ready to receive/run compiled code
function handleEnvironmentReady() {
  try {
    parent.postMessage(JSON.stringify({ id, type: 'ready' }), '*')
  } catch {}
}
