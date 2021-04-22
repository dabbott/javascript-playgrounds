import React, { PureComponent } from 'react'
import * as ExtendedJSON from '../../utils/ExtendedJSON'
import { prefixObject } from '../../utils/Styles'
import Phone from './Phone'
import { Message, ConsoleCommand } from '../../types/Messages'
import { encode } from '../../utils/queryString'
import { ExternalStyles } from './Workspace'
import type { ExternalModule } from '../player/VendorComponents'

const styles = prefixObject({
  iframe: {
    flex: '1 1 auto',
    minWidth: 0,
    minHeight: 0,
  },
})

interface Props {
  externalStyles: ExternalStyles
  environmentName: string
  platform: string
  width: number
  scale: number
  assetRoot: string
  statusBarHeight: number
  statusBarColor: string
  sharedEnvironment: boolean
  detectedModules: ExternalModule[]
  modules: ExternalModule[]
  styleSheet: string
  css: string
  prelude: string
  onRun: () => void
  onReady: () => void
  onConsole: (codeVersion: number, payload: ConsoleCommand) => void
  onError: (codeVersion: number, payload: string) => void
}

interface State {
  id: string | null
}

export default class PlayerFrame extends PureComponent<Props, State> {
  static defaultProps = {
    preset: 'react-native',
    platform: 'ios',
    width: 210,
    scale: 1,
    assetRoot: '',
    statusBarHeight: 0,
    statusBarColor: 'black',
    sharedEnvironment: true,
    modules: [],
    styleSheet: 'reset',
    css: '',
    prelude: '',
    onRun: () => {},
    onReady: () => {},
    onConsole: () => {},
    onError: () => {},
  }

  status: string = 'loading'
  fileMap?: Record<string, string>
  entry?: string
  codeVersion?: number

  state: State = {
    id: null,
  }

  iframe = React.createRef<HTMLIFrameElement>()

  componentDidMount() {
    const { sharedEnvironment } = this.props

    this.setState({
      id: Math.random().toString().slice(2),
    })

    const handleMessageData = (data: Message) => {
      if (data.id !== this.state.id) return

      switch (data.type) {
        case 'ready':
          this.status = 'ready'
          this.props.onReady()
          if (this.fileMap) {
            this.runApplication(this.fileMap, this.entry!, this.codeVersion!)
            this.fileMap = undefined
            this.entry = undefined
            this.codeVersion = undefined
          }
          break
        case 'error':
          this.props.onError(data.codeVersion, data.payload)
          break
        case 'console':
          this.props.onConsole(data.codeVersion, data.payload)
          break
      }
    }

    if (sharedEnvironment) {
      window.__message = handleMessageData
    }

    window.addEventListener('message', (e) => {
      let data: Message
      try {
        data = ExtendedJSON.parse(e.data) as Message
      } catch (err) {
        return
      }

      handleMessageData(data)
    })
  }

  runApplication(
    fileMap: Record<string, string>,
    entry: string,
    codeVersion: number
  ) {
    this.props.onRun()
    switch (this.status) {
      case 'loading':
        this.fileMap = fileMap
        this.entry = entry
        this.codeVersion = codeVersion
        break
      case 'ready':
        this.iframe.current!.contentWindow!.postMessage(
          { fileMap, entry, codeVersion, source: 'rnwp' },
          '*'
        )
        break
    }
  }

  reload() {
    if (!this.iframe.current) return

    this.iframe.current.contentWindow?.location.reload()
  }

  renderFrame = () => {
    const {
      externalStyles,
      environmentName,
      assetRoot,
      detectedModules,
      modules,
      styleSheet,
      css,
      statusBarColor,
      statusBarHeight,
      sharedEnvironment,
      prelude,
    } = this.props
    const { id } = this.state

    if (!id) return null

    const queryString = encode({
      environmentName,
      id,
      sharedEnvironment,
      assetRoot,
      detectedModules: JSON.stringify(detectedModules),
      modules: JSON.stringify(modules),
      styleSheet,
      css,
      statusBarColor,
      statusBarHeight,
      prelude,
      styles: JSON.stringify({
        playerRoot: externalStyles.playerRoot,
        playerWrapper: externalStyles.playerWrapper,
        playerApp: externalStyles.playerApp,
      }),
    })

    return (
      <iframe
        style={styles.iframe}
        ref={this.iframe}
        frameBorder={0}
        src={`player.html#${queryString}`}
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
