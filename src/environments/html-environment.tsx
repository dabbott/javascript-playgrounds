import { appendCSS } from '../utils/CSS'
import { initializeCommunication } from '../utils/playerCommunication'
import { createAppLayout } from '../utils/PlayerUtils'
import { EnvironmentOptions, IEnvironment } from './IEnvironment'

export class HTMLEnvironment implements IEnvironment {
  async initialize({
    id,
    sharedEnvironment,
    styles,
  }: EnvironmentOptions): Promise<void> {
    const { appElement } = createAppLayout(document, styles)
    const iframe = document.createElement('iframe')

    appElement.appendChild(iframe)

    initializeCommunication({
      id,
      prefixLineCount: 0,
      sharedEnvironment,
      onRunApplication: (context) => {
        const entryFile = context.fileMap[context.entry]

        const document = iframe.contentDocument

        if (!document) return

        // https://stackoverflow.com/questions/5784638/replace-entire-content-of-iframe
        document.close()
        document.open()
        document.write(entryFile)
        document.close()

        const cssFiles = Object.entries(context.fileMap).filter(([name]) =>
          name.endsWith('.css')
        )

        cssFiles.forEach(([_name, value]) => {
          appendCSS(document, value)
        })
      },
    })
  }
}

export default new HTMLEnvironment()
