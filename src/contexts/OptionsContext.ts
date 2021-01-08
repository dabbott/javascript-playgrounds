import { createContext, useContext } from 'react'
import { InternalOptions } from '../utils/options'

const OptionsContext = createContext<InternalOptions | undefined>(undefined)

export const OptionsProvider = OptionsContext.Provider

export const useOptions = () => {
  const options = useContext(OptionsContext)

  if (!options) {
    throw new Error(`Supply a Options component using OptionsContext.Provider`)
  }

  return options
}
