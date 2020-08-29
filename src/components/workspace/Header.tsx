import React, { CSSProperties, ReactNode, useMemo } from 'react'
import { mergeStyles, prefixObject } from '../../utils/Styles'

const styles = prefixObject({
  container: {
    flex: '0 0 40px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: '#3B3738',
  },
  text: {
    color: '#FFF',
    fontSize: 13,
    fontFamily: 'proxima-nova, "Helvetica Neue", Helvetica, Arial, sans-serif',
    fontWeight: 'bold',
    padding: '0 20px',
    display: 'flex',
    alignItems: 'center',
  },
  spacer: {
    flex: '1 1 auto',
  },
})

interface Props {
  text: string
  textStyle?: CSSProperties
  headerStyle?: CSSProperties
  children?: ReactNode
}

export default function Header({
  text = '',
  textStyle,
  headerStyle,
  children,
}: Props) {
  const computedContainerStyle = useMemo(
    () => mergeStyles(styles.container, headerStyle),
    [headerStyle]
  )
  const computedTextStyle = useMemo(() => mergeStyles(styles.text, textStyle), [
    textStyle,
  ])

  return (
    <div style={computedContainerStyle}>
      <div style={computedTextStyle}>{text}</div>
      <div style={styles.spacer} />
      {children}
    </div>
  )
}
