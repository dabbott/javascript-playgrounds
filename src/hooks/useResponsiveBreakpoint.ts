import useWindowDimensions from './useWindowDimensions'

export default function useResponsiveBreakpoint(breakpoints: number[]): number {
  const dimensions = useWindowDimensions()

  if (dimensions.width === undefined) {
    return breakpoints.length - 1
  }

  const index = breakpoints.findIndex(
    (breakpoint) => breakpoint > dimensions.width
  )

  return index >= 0 ? index : breakpoints.length - 1
}
