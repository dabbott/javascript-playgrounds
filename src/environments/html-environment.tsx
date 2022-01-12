import { bundle } from 'packly'
import consoleProxy, { ConsoleProxy } from '../components/player/ConsoleProxy'
import * as path from '../utils/path'
import {
  bindConsoleLogMethods,
  createWindowErrorHandler,
  initializeCommunication,
} from '../utils/playerCommunication'
import { createAppLayout } from '../utils/PlayerUtils'
import {
  EnvironmentOptions,
  EvaluationContext,
  IEnvironment,
} from './IEnvironment'

// Inline stylesheets and scripts
function generateBundle(context: EvaluationContext) {
  return bundle({
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
}

function bindIframeCommunication(
  iframe: HTMLIFrameElement,
  { id, codeVersion }: { id: string; codeVersion: number }
) {
  const iframeWindow = iframe.contentWindow! as Window & {
    console: ConsoleProxy
  }

  bindConsoleLogMethods({
    consoleProxy: iframeWindow.console,
    codeVersion,
    id,
    prefixLineCount: 0,
    sharedEnvironment: false,
  })

  iframeWindow.onerror = createWindowErrorHandler({
    codeVersion,
    id,
    prefixLineCount: 0,
  })
}

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
      consoleProxy,
      onRunApplication: (context) => {
        const html = generateBundle(context)

        const document = iframe.contentDocument

        if (!document) return

        // https://stackoverflow.com/questions/5784638/replace-entire-content-of-iframe
        document.close()
        document.open()

        bindIframeCommunication(iframe, {
          id,
          codeVersion: context.codeVersion,
        })

        document.write(html)
        document.close()
      },
    })
  }
}

export default new HTMLEnvironment()
