import React, { PureComponent } from 'react'
import * as ExtendedJSON from '../../utils/ExtendedJSON'
import { prefixObject } from '../../utils/PrefixInlineStyles'
import Phone from './Phone'
import { LogEntry } from './Console'

const styles = prefixObject({
  iframe: {
    flex: '1 1 auto',
    minWidth: 0,
    minHeight: 0,
  },
})

interface Props {
  platform: string
  width: number
  scale: number
  assetRoot: string
  statusBarHeight: number
  statusBarColor: string
  sharedEnvironment: boolean
  vendorComponents: unknown[]
  playerStyleSheet: string
  playerCSS: string
  prelude: string
  onError: (payload: string) => void
  onRun: () => void
  onConsole: (payload: LogEntry) => void
}

interface State {
  id: string | null
}

type MessageData = {
  id: string
} & (
  | {
      type: 'ready'
    }
  | {
      type: 'error'
      payload: string
    }
  | {
      type: 'console'
      payload: LogEntry
    }
)

export default class extends PureComponent<Props, State> {
  static defaultProps = {
    platform: 'ios',
    width: 300,
    scale: 1,
    assetRoot: '',
    statusBarHeight: 0,
    statusBarColor: 'black',
    sharedEnvironment: true,
    vendorComponents: [],
    playerStyleSheet: '',
    playerCSS: '',
    prelude: '',
    onError: () => {},
    onRun: () => {},
    onConsole: () => {},
  }

  status: string = 'loading'
  fileMap?: Record<string, string>
  entry?: string

  state = {
    id: null,
  }

  componentDidMount() {
    const { sharedEnvironment } = this.props

    this.setState({
      id: Math.random().toString().slice(2),
    })

    const handleMessageData = (data: MessageData) => {
      if (data.id !== this.state.id) return

      switch (data.type) {
        case 'ready':
          this.status = 'ready'
          if (this.fileMap) {
            this.runApplication(this.fileMap, this.entry!)
            this.fileMap = undefined
            this.entry = undefined
          }
          break
        case 'error':
          this.props.onError(data.payload)
          break
        case 'console':
          this.props.onConsole(data.payload)
          break
      }
    }

    if (sharedEnvironment) {
      ;(window as any).__message = handleMessageData
    }

    window.addEventListener('message', (e) => {
      let data
      try {
        data = ExtendedJSON.parse(e.data)
      } catch (err) {
        return
      }

      handleMessageData(data)
    })
  }

  runApplication(fileMap: Record<string, string>, entry: string) {
    this.props.onRun()
    switch (this.status) {
      case 'loading':
        this.fileMap = fileMap
        this.entry = entry
        break
      case 'ready':
        ;(this.refs.iframe as HTMLIFrameElement).contentWindow!.postMessage(
          { fileMap, entry, source: 'rnwp' },
          '*'
        )
        break
    }
  }

  renderFrame = () => {
    const {
      assetRoot,
      vendorComponents,
      playerStyleSheet,
      playerCSS,
      statusBarColor,
      statusBarHeight,
      sharedEnvironment,
      prelude,
    } = this.props
    const { id } = this.state

    if (!id) return null

    const vendorComponentsEncoded = encodeURIComponent(
      JSON.stringify(vendorComponents)
    )
    const css = encodeURIComponent(playerCSS)
    const preludeEncoded = encodeURIComponent(prelude)

    return (
      <iframe
        style={styles.iframe}
        ref={'iframe'}
        frameBorder={0}
        src={`player.html#id=${id}&sharedEnvironment=${sharedEnvironment}&assetRoot=${assetRoot}&vendorComponents=${vendorComponentsEncoded}&styleSheet=${playerStyleSheet}&css=${css}&statusBarColor=${statusBarColor}&statusBarHeight=${statusBarHeight}&prelude=${preludeEncoded}`}
      />
    )
  }

  render() {
    const { width, scale, platform } = this.props

    if (platform === 'web') {
      return this.renderFrame()
    }

    return (
      <Phone width={width} device={platform} scale={scale}>
        {this.renderFrame()}
      </Phone>
    )
  }
}
