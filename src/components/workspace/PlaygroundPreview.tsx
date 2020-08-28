import { ResizeObserver } from '@juggle/resize-observer'
import React, { MutableRefObject, useEffect, useRef, RefObject } from 'react'
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

function useResizeObserver(ref: RefObject<HTMLDivElement>, f: () => void) {
  useEffect(() => {
    let resizeObserver: ResizeObserver
    let mounted = true

    import('@juggle/resize-observer').then(({ ResizeObserver }) => {
      if (!mounted) return

      resizeObserver = new ResizeObserver(() => {
        f()
      })

      if (ref.current) {
        resizeObserver.observe(ref.current)
      }
    })

    return () => {
      mounted = false

      if (ref.current && resizeObserver) {
        resizeObserver.unobserve(ref.current)
      }
    }
  }, [])
}

interface Props {
  indent: string
  renderReactElements: boolean
  data: unknown[]
  didResize: () => void
}

export default function PlaygroundPreview({
  indent,
  data,
  didResize,
  renderReactElements,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useResizeObserver(ref, didResize)

  return (
    <div ref={ref} style={{ ...styles.container, marginLeft: indent }}>
      <div style={styles.content}>
        <MultiInspector data={data} renderReactElements={renderReactElements} />
      </div>
    </div>
  )
}
