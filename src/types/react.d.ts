import { ReactElement } from 'react'

declare module 'react' {
  function memo<A, B>(
    Component: (props: A) => B
  ): (props: A) => ReactElement | null
}
