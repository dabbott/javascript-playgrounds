import { useEffect, useRef } from 'react'

export default function useRerenderEffect<
  T extends (...args: any[]) => any,
  U extends any[]
>(f: T, deps: U) {
  const didMount = useRef(false)

  useEffect(() => {
    if (didMount.current) {
      f()
    } else {
      didMount.current = true
    }
  }, deps)
}
