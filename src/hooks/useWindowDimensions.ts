import { useEffect, useState } from 'react'

export default function useWindowDimensions() {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    // height: window.innerHeight,
  })

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        // height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return dimensions
}
