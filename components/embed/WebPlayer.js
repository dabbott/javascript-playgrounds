import React, { Component, PropTypes } from 'react'

const paramSchema = {

  // Plain text
  title: 'text',
  transpilerTitle: 'text',
  playerTitle: 'text',
  code: 'text',
  entry: 'text',
  initialTab: 'text',
  platform: 'text',
  fullscreen: 'text',
  width: 'text',
  scale: 'text',
  assetRoot: 'text',
  workspaceCSS: 'text',
  playerCSS: 'text',
  playerStyleSheet: 'text',

  // JSON-encoded
  files: 'json',
  vendorComponents: 'json',
  panes: 'json',
  styles: 'json',
  console: 'json',
}

const createUrlParams = (params) => {
  return Object.keys(params).map(key => {
    return `${key}=${encodeURIComponent(params[key])}`
  }).join('&')
}

const encodeParams = (params) => {
  return Object.keys(params).reduce((acc, key) => {
    const value = params[key]

    if (typeof value === 'undefined') return acc

    acc[key] = paramSchema[key] === 'json'
      ? JSON.stringify(value)
      : value

    return acc
  }, {})
}

const WEB_PLAYER_VERSION = '1.9.1'
const WEB_PLAYER_URL = `//cdn.rawgit.com/dabbott/react-native-web-player/gh-v${WEB_PLAYER_VERSION}/index.html`

const styles = {
  iframe: {
    width: '100%',
    height: '100%',
  },
}

/**
 * A React component wrapper for the embeddable iframe player. This ensures
 * properties are passed and encoded correctly.
 *
 * Most props are passed directly through to the player; props passed into the
 * player can't be changed after the initial render. Other props can be updated
 * normally.
 */
export default class WebPlayer extends Component {

  static propTypes = {
    style: PropTypes.any,
    className: PropTypes.string,
    baseURL: PropTypes.string,

    // Passthrough
    title: PropTypes.string,
    transpilerTitle: PropTypes.string,
    playerTitle: PropTypes.string,
    code: PropTypes.string,
    entry: PropTypes.string,
    initialTab: PropTypes.string,
    platform: PropTypes.string,
    fullscreen: PropTypes.bool,
    width: PropTypes.number,
    scale: PropTypes.number,
    assetRoot: PropTypes.string,
    workspaceCSS: PropTypes.string,
    playerCSS: PropTypes.string,
    playerStyleSheet: PropTypes.string,
    files: PropTypes.array,
    vendorComponents: PropTypes.array,
    panes: PropTypes.array,
    styles: PropTypes.object,
    console: PropTypes.object,
  }

  static defaultProps = {
    baseURL: WEB_PLAYER_URL,
  }

  constructor(props) {
    super()

    const params = {...props}
    delete params.style
    delete params.className
    delete params.baseURL

    const encodedParams = encodeParams(params)
    const hash = '#' + createUrlParams(encodedParams)

    this.hash = hash
  }

  shouldComponentUpdate(nextProps) {
    return (
      this.props.style !== nextProps.style ||
      this.props.baseURL !== nextProps.baseURL
    )
  }

  render() {
    const {hash} = this
    const {style, className, baseURL} = this.props

    return (
      <div
        style={style}
        className={className}
      >
        <iframe
          style={styles.iframe}
          frameBorder={0}
          allowFullScreen
          src={`${baseURL}${hash}`}
        />
      </div>
    )
  }
}
