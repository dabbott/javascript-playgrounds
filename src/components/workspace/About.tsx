import React, { memo, useMemo } from 'react'
import snarkdown from 'snarkdown'

interface Props {
  text: string
}

export default memo(function About({ text }: Props) {
  const markdownContent = useMemo(() => (text ? snarkdown(text) : ''), [text])

  return (
    <div>
      {markdownContent && (
        <div dangerouslySetInnerHTML={{ __html: markdownContent }} />
      )}
      {markdownContent && <br />}
      Powered by{' '}
      <a
        target="_blank"
        href={'https://github.com/dabbott/javascript-playgrounds'}
      >
        JavaScript Playgrounds
      </a>
    </div>
  )
})
