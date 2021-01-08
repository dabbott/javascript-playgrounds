import React, { CSSProperties, memo } from 'react'
import { mergeStyles, prefixObject } from '../../utils/Styles'

const styles = prefixObject({
  text: {
    color: '#FFF',
    fontSize: 13,
    fontFamily: 'proxima-nova, "Helvetica Neue", Helvetica, Arial, sans-serif',
    padding: '0 20px',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
})

interface Props {
  children: React.ReactNode
  textStyle?: CSSProperties
  onClick?: () => void
}

export default memo(function Fullscreen({
  textStyle,
  onClick,
  children,
}: Props) {
  const computedTextStyle = mergeStyles(styles.text, textStyle)

  return (
    <div style={computedTextStyle} onClick={onClick}>
      {children}
    </div>
  )
})
