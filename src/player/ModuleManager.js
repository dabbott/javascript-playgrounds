import WindowHook from './WindowHook'

const prefix = `
var exports = {};
var module = {exports: exports};

(function(module, exports, require) {
`

const getSuffix = name => `
})(module, exports, window.__module.require);
window.__module.requireCache['${name}'] = module.exports;
;
`

const prefixLineCount = prefix.split('\n').length - 1

class ModuleManager {

  requireCache = {}
  codeCache = {}

  buildErrorInfo = (e) => {
    const info = {name: e.name, message: e.message}
    let line = null

    // Safari
    if (e.line != null) {
      line = e.line

      // FF
    } else if (e.lineNumber != null) {
      line = e.lineNumber

    // Chrome
    } else if (e.stack) {
      const matched = e.stack.match(/<anonymous>:(\d+)/)
      if (matched) {
        line = parseInt(matched[1])
      }
    }

    if (typeof line === 'number') {
      line -= prefixLineCount
      info.line = line
    }

    return info
  }

  evaluate = (name, code) => {
    const wrapped = prefix + code + getSuffix(name)

    try {
      eval(wrapped)
    } catch (e) {
      const info = this.buildErrorInfo(e)

      console.log('module.evaluate error', info)

      WindowHook.postMessage({
        type: 'error',
        payload: info,
      })
    }
  }

  // Provide code for either an individual module or a map of modules
  provide = (name, code) => {
    const {requireCache, codeCache} = this

    if (typeof name === 'string') {
      delete requireCache[name]

      codeCache[name] = code
    } else {
      Object.keys(name).forEach(key => this.provide(key, name[key]))
    }
  }

  // Inject either an individual module or a map of modules into the requireCache
  inject = (name, mod) => {
    const {requireCache} = this

    if (typeof name === 'string') {
      requireCache[name] = mod
    } else {
      Object.keys(name).forEach(key => this.inject(key, name[key]))
    }
  }

  require = (name) => {
    const {requireCache, codeCache} = this

    if (!requireCache[name]) {
      if (!codeCache[name]) {
        console.error(`Module ${name} not provided to player!`)
      }

      this.evaluate(name, codeCache[name])
    }

    return requireCache[name]
  }

  resetRequireCache = () => {
    this.requireCache = {}
  }

}

const moduleManager = new ModuleManager()

window.__module = moduleManager

export default moduleManager
