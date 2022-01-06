import { bundle } from 'packly'
import * as path from '../utils/path'
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
    iframe.style.width = '100%'
    iframe.style.height = '100%'

    appElement.appendChild(iframe)

    initializeCommunication({
      id,
      prefixLineCount: 0,
      sharedEnvironment,
      onRunApplication: (context) => {
        const html = bundle({
          entry: context.entry,
          request({ origin, url }) {
            if (origin === undefined) return context.fileMap[url]

            // Don't inline (external) urls starting with http://, https://, or //
            if (/^(https?)?\/\//.test(url)) return undefined

            // Inline absolute urls
            if (url.startsWith('/')) return context.fileMap[url.slice(1)]

            // Inline relative urls
            const lookup = path.join(path.dirname(origin), url)

            return context.fileMap[lookup]
          },
        })

        const document = iframe.contentDocument

        if (!document) return

        // https://stackoverflow.com/questions/5784638/replace-entire-content-of-iframe
        document.close()
        document.open()
        document.write(html)
        document.close()
      },
    })
  }
}

export default new HTMLEnvironment()
