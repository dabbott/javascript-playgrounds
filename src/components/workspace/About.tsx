import React, { memo, useMemo } from 'react'
import snarkdown from 'snarkdown'

interface Props {
  text: string
}

export default memo(function About({ text }: Props) {
  const markdownContent = useMemo(() => snarkdown(text), [text])

  return <div dangerouslySetInnerHTML={{ __html: markdownContent }} />
})
