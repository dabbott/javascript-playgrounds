import React, { memo, useMemo } from 'react'
import { prefix, prefixObject } from '../../utils/Styles'

interface Props {
  size?: number
}

const styles = prefixObject({
  flexSpacer: { flex: '1', display: 'block' },
})

export const VerticalSpacer = memo(({ size }: Props) => {
  const style = useMemo(
    () =>
      prefix(
        size === undefined
          ? styles.flexSpacer
          : { height: `${size}px`, display: 'block' }
      ),
    [size]
  )

  return <span style={style} />
})

export const HorizontalSpacer = memo(({ size }: Props) => {
  const style = useMemo(
    () =>
      prefix(
        size === undefined
          ? styles.flexSpacer
          : { width: `${size}px`, display: 'block' }
      ),
    [size]
  )

  return <span style={style} />
})
