import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'

import { prefix, prefixObject } from '../../utils/PrefixInlineStyles'

// Devices have pixel density of 2, but we also zoom in for visibility at small sizes.
const dimensions = {
  ios: {
    deviceImageUrl: 'https://cdn.rawgit.com/koenbok/Framer/master/extras/DeviceResources/iphone-6-silver.png',
    deviceImageWidth: 870,
    deviceImageHeight: 1738,
    screenWidth: 750,
    screenHeight: 1334,
    devicePixelDensity: 2,
    zoom: 1.5,
  },
  android: {
    deviceImageUrl: 'https://cdn.rawgit.com/koenbok/Framer/master/extras/DeviceResources/google-nexus-5x.png',
    deviceImageWidth: 1204,
    deviceImageHeight: 2432,
    screenWidth: 1080,
    screenHeight: 1920,
    devicePixelDensity: 2,
    zoom: 2,
  },
}

@pureRender
export default class extends Component {

  static defaultProps = {
    width: 300,
    device: 'ios',
    scale: 1,
  }

  render() {
    const {children, width, device, scale: initialScale} = this.props
    const {deviceImageUrl, deviceImageWidth, deviceImageHeight, devicePixelDensity, screenWidth, screenHeight, zoom} = dimensions[device]

    const imageScale = width / deviceImageWidth
    const height = imageScale * deviceImageHeight
    const scale = initialScale * devicePixelDensity * zoom

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
        transform: `scale(${imageScale}, ${imageScale})`,
        transformOrigin: '0 0 0px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      screen: {
        backgroundColor: 'white',
        width: screenWidth / scale,
        height: screenHeight / scale,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        position: 'relative',
        transform: `scale(${scale}, ${scale})`,
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
