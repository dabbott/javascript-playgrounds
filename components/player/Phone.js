import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'

import { prefix, prefixObject } from '../../utils/PrefixInlineStyles'

const dimensions = {
  ios: {
    deviceImageUrl: 'https://cdn.rawgit.com/koenbok/Framer/master/extras/DeviceResources/iphone-6-silver.png',
    deviceImageWidth: 870,
    deviceImageHeight: 1738,
    screenWidth: 750,
    screenHeight: 1334,
  },
  android: {
    deviceImageUrl: 'https://cdn.rawgit.com/koenbok/Framer/master/extras/DeviceResources/google-nexus-4.png',
    deviceImageWidth: 860,
    deviceImageHeight: 1668,
    screenWidth: 768,
    screenHeight: 1280,
  },
}

@pureRender
export default class extends Component {

  static defaultProps = {
    width: 300,
    device: 'ios',
  }

  render() {
    const {children, width, device} = this.props
    const {deviceImageUrl, deviceImageWidth, deviceImageHeight, screenWidth, screenHeight} = dimensions[device]

    const scale = width / deviceImageWidth
    const height = scale * deviceImageHeight

    const styles = prefixObject({
      container: {
        width,
        height,
        margin: '0 auto',
      },
      phone: {
        width: deviceImageWidth,
        height: deviceImageHeight,
        backgroundImage: `url(${deviceImageUrl})`,
        transform: `scale(${scale}, ${scale})`,
        transformOrigin: '0 0 0px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      screen: {
        backgroundColor: 'white',
        width: screenWidth / 2,
        height: screenHeight / 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        position: 'relative',
        transform: `scale(${2}, ${2})`,
        overflow: 'hidden',
      },
    })

    return (
      <div style={styles.container}>
        <div style={styles.phone}>
          <div style={styles.screen}>
            {children}
          </div>
        </div>
      </div>
    )
  }
}
