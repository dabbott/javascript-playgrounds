import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'

import { prefix, prefixObject } from '../../utils/PrefixInlineStyles'
import DEVICES from '../../constants/Devices'

@pureRender
export default class extends Component {

  static defaultProps = {
    width: 500,
    platform: 'ios',
    deviceType: 'phone',
    orientation: 'portrait',
    scale: 1,
  }

  render() {
    const {children, width, platform, deviceType, orientation, scale} = this.props
    console.log(deviceType, platform, orientation)
    const {deviceImageUrl, deviceImageWidth, deviceImageHeight, screenWidth, screenHeight} = DEVICES[deviceType][platform]
    const isLandscape = orientation === 'landscape';
    const imageScale = width / deviceImageWidth
    const height = imageScale * deviceImageHeight

    const screenOrientedWidth = isLandscape ? screenHeight : screenWidth;
    const screenOrientedHeight = isLandscape ? screenWidth : screenHeight;

    const styles = prefixObject({
      container: {
        width: isLandscape ? height : width,
        height: isLandscape ? width : height,
        margin: '0 auto',
      },
      frame: {
        width,
        height,
        margin: '0 auto',
        position: 'relative',
        backgroundImage: `url(${deviceImageUrl})`,
        backgroundSize: 'cover',
        transform: isLandscape && `rotate(-90deg) translateX(${(height - width) / 2}px)`,
      },
      screen: {
        position: 'absolute',
        top: (deviceImageHeight - screenHeight) / 2 * imageScale,
        left: (deviceImageWidth - screenWidth) / 2 * imageScale,
        width: screenWidth * imageScale,
        height: screenHeight * imageScale,
        backgroundColor: 'white',
      },
      overlay: {
        position: 'absolute',
        top: ((isLandscape ? deviceImageWidth : deviceImageHeight) - screenOrientedHeight) / 2 * imageScale,
        left: ((isLandscape ? deviceImageHeight : deviceImageWidth) - screenOrientedWidth) / 2 * imageScale,
        width: screenOrientedWidth * imageScale / scale,
        height: screenOrientedHeight * imageScale / scale,

        transform: `scale(${scale}, ${scale})`,
        transformOrigin: '0 0 0px',
        display: 'flex',
      },
    })

    return (
      <div style={styles.container}>
        <div style={styles.frame}>
          <div style={styles.screen} />
        </div>
        <div style={styles.overlay}>
          {children}
        </div>
      </div>
    )
  }
}
