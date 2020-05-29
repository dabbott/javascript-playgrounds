import React, { PureComponent } from 'react'
import * as ExtendedJSON from '../../utils/ExtendedJSON'
import { prefixObject } from '../../utils/PrefixInlineStyles'
import Phone from './Phone'

const styles = prefixObject({
  iframe: {
    flex: '1 1 auto',
    minWidth: 0,
    minHeight: 0,
  },
})

export default class extends PureComponent {
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
    onError: () => {},
    onRun: () => {},
    onConsole: () => {},
  }

  constructor(props) {
    super(props)

    this.state = {
      id: null,
    }

    this.status = 'loading'
    this.fileMap = null
    this.entry = null
  }

  componentDidMount() {
    const { sharedEnvironment } = this.props

    this.setState({
      id: Math.random().toString().slice(2),
    })

    const handleMessageData = (data) => {
      const { id, type, payload } = data

      if (id !== this.state.id) return

      switch (type) {
        case 'ready':
          this.status = 'ready'
          if (this.fileMap) {
            this.runApplication(this.fileMap, this.entry)
            this.fileMap = null
            this.entry = null
          }
          break
        case 'error':
          this.props.onError(payload)
          break
        case 'console':
          this.props.onConsole(payload)
          break
      }
    }

    if (sharedEnvironment) {
      window.__message = handleMessageData
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

  runApplication(fileMap, entry) {
    this.props.onRun()
    switch (this.status) {
      case 'loading':
        this.fileMap = fileMap
        this.entry = entry
        break
      case 'ready':
        this.refs.iframe.contentWindow.postMessage(
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
    } = this.props
    const { id } = this.state

    if (!id) return null

    const vendorComponentsEncoded = encodeURIComponent(
      JSON.stringify(vendorComponents)
    )
    const css = encodeURIComponent(playerCSS)

    return (
      <iframe
        style={styles.iframe}
        ref={'iframe'}
        frameBorder={0}
        src={`player.html#id=${id}&sharedEnvironment=${sharedEnvironment}&assetRoot=${assetRoot}&vendorComponents=${vendorComponentsEncoded}&styleSheet=${playerStyleSheet}&css=${css}&statusBarColor=${statusBarColor}&statusBarHeight=${statusBarHeight}`}
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
