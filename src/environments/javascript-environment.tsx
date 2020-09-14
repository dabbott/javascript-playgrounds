import type { IEnvironment } from './IEnvironment'

const Environment: IEnvironment = {
  initialize() {
    return Promise.resolve()
  },

  hasModule(_) {
    return false
  },

  requireModule(_) {},
}

export default Environment
