import { PlayerStyles } from '../player'
import { prefixAndApply } from './Styles'

export function createAppLayout(document: Document, styles: PlayerStyles) {
  const mount = document.getElementById('player-root') as HTMLDivElement
  prefixAndApply(styles.playerRoot, mount)

  const wrapperElement = document.createElement('div')
  prefixAndApply(styles.playerWrapper, wrapperElement)

  mount.appendChild(wrapperElement)

  const appElement = document.createElement('div')
  appElement.id = 'app'
  prefixAndApply(styles.playerApp, appElement)

  wrapperElement.appendChild(appElement)

  return { wrapperElement, appElement }
}
