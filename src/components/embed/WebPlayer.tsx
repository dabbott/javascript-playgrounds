import React, { CSSProperties, memo, useMemo } from 'react'
import type { PublicOptions } from '../../utils/options'

declare global {
  // Defined in webpack config
  const VERSION: string
}

const WEB_PLAYER_URL = `https://unpkg.com/javascript-playgrounds@${VERSION}/public/index.html`

const styles = {
  iframe: {
    width: '100%',
    height: '100%',
  },
}

interface OwnProps {
  style?: CSSProperties
  className?: string
  baseURL?: string
}

export type WebPlayerProps = OwnProps & PublicOptions

/**
 * A React component wrapper for the embeddable iframe player. This ensures
 * properties are passed and encoded correctly.
 *
 * Most props are passed directly through to the player; props passed into the
 * player can't be changed after the initial render. Other props can be updated
 * normally.
 */
export default memo(function WebPlayer({
  style,
  className,
  baseURL = WEB_PLAYER_URL,
  ...rest
}: WebPlayerProps) {
  // If the baseURL changes, set a new src.
  // We don't refresh the player if other props change.
  const src = useMemo(
    () => `${baseURL}#data=${encodeURIComponent(JSON.stringify(rest))}`,
    [baseURL]
  )

  return (
    <div style={style} className={className}>
      <iframe style={styles.iframe} frameBorder={0} allowFullScreen src={src} />
    </div>
  )
},
propsAreEqual)

function propsAreEqual(
  prevProps: WebPlayerProps,
  nextProps: WebPlayerProps
): boolean {
  return (
    prevProps.style === nextProps.style &&
    prevProps.className === nextProps.className &&
    prevProps.baseURL === nextProps.baseURL
  )
}
