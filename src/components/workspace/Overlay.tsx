import React, { CSSProperties, memo, ReactNode } from 'react'
import { prefixObject } from '../../utils/PrefixInlineStyles'

let styles: Record<string, CSSProperties> = {
  container: {
    flex: '1',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    whiteSpace: 'pre-wrap',
  },
  text: {
    flex: '1',
    color: 'rgba(0,0,0,0.5)',
    fontSize: 13,
    fontFamily: 'proxima-nova, "Helvetica Neue", Helvetica, Arial, sans-serif',
    lineHeight: '20px',
    padding: '12px',
  },
}

styles.error = {
  ...styles.text,
  color: '#C92C2C',
}

styles = prefixObject(styles)

interface Props {
  children?: ReactNode
  isError: boolean
}

export default memo(function Overlay({
  children = '',
  isError = false,
}: Props) {
  return (
    <div style={styles.container}>
      <div style={isError ? styles.error : styles.text}>{children}</div>
    </div>
  )
})
