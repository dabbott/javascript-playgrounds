import React, { PureComponent, ReactNode, memo, useMemo } from 'react'
import PHONES from '../../constants/Phones'
import { prefixObject } from '../../utils/PrefixInlineStyles'

interface Props {
  width: number
  device: string
  scale: number
  children?: ReactNode
}

export default memo(function Phone(
  { width, device, scale, children }: Props = {
    width: 500,
    device: 'ios',
    scale: 1,
  }
) {
  const {
    deviceImageUrl,
    deviceImageWidth,
    deviceImageHeight,
    screenWidth,
    screenHeight,
  } = PHONES[device]

  const imageScale = Number(width) / deviceImageWidth
  const height = imageScale * deviceImageHeight

  const styles = useMemo(() => {
    return prefixObject({
      container: {
        width,
        height,
        margin: '0 auto',
        position: 'relative',
        backgroundImage: `url(${deviceImageUrl})`,
        backgroundSize: 'cover',
      },
      screen: {
        position: 'absolute',
        top: ((deviceImageHeight - screenHeight) / 2) * imageScale,
        left: ((deviceImageWidth - screenWidth) / 2) * imageScale,
        width: screenWidth * imageScale,
        height: screenHeight * imageScale,
        backgroundColor: 'white',
      },
      overlay: {
        position: 'absolute',
        top: ((deviceImageHeight - screenHeight) / 2) * imageScale,
        left: ((deviceImageWidth - screenWidth) / 2) * imageScale,
        width: (screenWidth * imageScale) / scale,
        height: (screenHeight * imageScale) / scale,
        transform: `scale(${scale}, ${scale})`,
        transformOrigin: '0 0 0px',
        display: 'flex',
      },
    })
  }, [
    deviceImageUrl,
    deviceImageHeight,
    deviceImageWidth,
    screenHeight,
    screenWidth,
    imageScale,
    scale,
  ])

  return (
    <div style={styles.container}>
      <div style={styles.screen} />
      <div style={styles.overlay}>{children}</div>
    </div>
  )
})
