import React, { Component, useLayoutEffect, useRef, useEffect } from 'react'
import pureRender from 'pure-render-decorator'

import { prefixObject } from '../../utils/PrefixInlineStyles'
import { MultiInspector } from './Inspector'

const styles = prefixObject({
  container: {
    backgroundColor: 'rgba(0,0,0,0.02)',
    border: '1px solid rgba(0,0,0,0.05)',
    padding: '4px 8px',
    borderRadius: 8,
    display: 'inline-block',
    flexDirection: 'row',
    alignItems: 'stretch',
    minWidth: 0,
    minHeight: 0,
  },
  content: {
    display: 'flex',
  },
  itemSpacer: {
    width: 8,
  },
})

export default function PlaygroundPreview({ indent, data, didResize }) {
  const ref = useRef(null)

  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return

    const resizeObserver = new ResizeObserver(() => {
      didResize()
    })

    resizeObserver.observe(ref.current)

    return () => resizeObserver.unobserve(ref.current)
  }, [])

  return (
    <div ref={ref} style={{ ...styles.container, marginLeft: indent }}>
      <div style={styles.content}>
        <MultiInspector data={data} />
      </div>
    </div>
  )
}
