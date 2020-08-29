import React, { CSSProperties, memo } from 'react'
import screenfull from 'screenfull'
import { mergeStyles, prefixObject } from '../../utils/Styles'

const styles = prefixObject({
  text: {
    color: '#FFF',
    fontSize: 13,
    fontFamily: 'proxima-nova, "Helvetica Neue", Helvetica, Arial, sans-serif',
    padding: '0 20px',
    display: 'flex',
    alignItems: 'center',
  },
})

interface Props {
  textStyle?: CSSProperties
}

const toggleFullscreen = () => (screenfull as any).toggle()

export default memo(function Fullscreen({ textStyle }: Props) {
  const computedTextStyle = mergeStyles(styles.text, textStyle)

  return (
    <div style={computedTextStyle} onClick={toggleFullscreen}>
      Fullscreen
    </div>
  )
})
