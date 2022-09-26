import $scriptjs from 'scriptjs'

import * as Networking from '../../utils/Networking'

// Stubs for registering and getting vendor components
const externalModules: Record<string, unknown> = {}
const cjsModules: Record<string, string> = {}

// Allow for keypaths for use in namespacing (Org.Component.Blah)
const getObjectFromKeyPath = (data: any, keyPath: string): unknown => {
  return keyPath
    .split('.')
    .reduce((prev: any, curr: string) => prev[curr], data)
}

export type ExternalModuleShorthand = string
export type ExternalModuleDescription = {
  name: string
  url: string
  globalName?: string
}
export type ExternalModule = ExternalModuleShorthand | ExternalModuleDescription

// Currently there are two kinds of components:
// - "externals", which use register/get. These store the *actual value*
// - "modules", which use define/require. These store *just the code* and must
//   be executed in the module wrapper before use.
// TODO figure out how to merge these
export default class VendorComponents {
  static get modules() {
    return cjsModules
  }

  // Register an external
  // name: name used in import/require
  // value: external to resolve
  static register(name: string, value: unknown) {
    externalModules[name] = value
  }

  // Get an external by name
  static get(name: string) {
    return externalModules[name]
  }

  // Register a module
  // name: name used in import/require
  // code: module code to execute
  static define(name: string, code: string) {
    cjsModules[name] = code
  }

  // Get a module by name
  static require(name: string) {
    return cjsModules[name]
  }

  static loadModules(modules: ExternalModuleDescription[]) {
    return Promise.all(
      modules.map(async ({ name, url }) => {
        const text = await Networking.get(url)

        VendorComponents.define(name, text)
      })
    )
  }

  static loadExternals(
    externals: (ExternalModuleDescription & { globalName: string })[]
  ) {
    return new Promise<void>((resolve) => {
      if (externals.length === 0) {
        resolve()
        return
      }

      const urls = externals.map((vc) => vc.url)

      $scriptjs(urls, () => {
        externals.forEach(({ name, globalName }) => {
          // Inject into vendor components
          VendorComponents.register(
            name,
            getObjectFromKeyPath(window, globalName)
          )
        })
        resolve()
      })
    })
  }

  static normalizeExternalModule(
    component: ExternalModule
  ): ExternalModuleDescription {
    return typeof component === 'string'
      ? {
          name: component,
          url: `https://unpkg.com/${component}`,
        }
      : component
  }

  // Load components from urls
  static load(components: ExternalModuleDescription[]): Promise<void> {
    const modules = components.filter((vc) => !vc.globalName)
    const externals = components.filter(
      (vc) => !!vc.globalName
    ) as (ExternalModuleDescription & { globalName: string })[]

    return Promise.all([
      this.loadModules(modules),
      this.loadExternals(externals),
    ]).then(() => {})
  }
}
