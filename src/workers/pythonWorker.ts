import { document, DOMCanvasElement, reset } from '../utils/MockDOM'

const context: Worker & {
  importScripts: (...urls: string[]) => void // Why isn't this part of the TS lib?

  // Pyodide
  pyodide: Pyodide
  languagePluginLoader: Promise<void>

  // Globals passed to python
  __source__: string
  __variables__: string[]
  __log__: (line: number, col: number, ...args: unknown[]) => void
} = self as any

interface Pyodide {
  runPython: (code: string) => unknown
  runPythonAsync: (
    code: string,
    messageCallback: (...args: any[]) => void,
    errorCallback: (...args: any[]) => void
  ) => Promise<unknown>
  eval_code: (code: string, namespace: Record<string, unknown>) => unknown
  loadPackage: (name: string | string[]) => Promise<void>
  repr: (obj: unknown) => string
  loadedPackages: Record<string, string>
  globals: Record<string, any>
  _module: {
    packages: {
      import_name_to_package_name: Record<string, string>
    }
  }
}

Object.assign(context, {
  document,
  window: self,
})

context.importScripts('https://pyodide-cdn2.iodide.io/v0.15.0/full/pyodide.js')

export type PythonMessage =
  | {
      type: 'init'
    }
  | {
      type: 'run'
      code: string
      requestId: number
    }

export type PythonResponse = {}

const DeleteGlobals = `
import js

js_vars__ = js.self.__variables__
global_keys__ = list(globals().keys())

for key__ in global_keys__:
  if (key__ != "js") and (key__ not in js_vars__) and (not key__.endswith('__')):
    del globals()[key__]
`

const ConsoleLogTransformer = `
import ast
import js

__log__ = js.self.__log__

class LogEnhancer(ast.NodeTransformer):
  def visit_Call(self, node: ast.Call):
    if type(node.func).__name__ == "Name" and node.func.id == "print":
      node.func.id = "__log__"

      line = ast.Num(node.lineno)
      line.lineno = node.lineno
      line.col_offset = node.col_offset
      node.args.insert(0, line)

      col = ast.Num(node.col_offset)
      col.lineno = node.lineno
      col.col_offset = node.col_offset
      node.args.insert(1, col)
        
    return node

tree = ast.parse(js.self.__source__)
optimizer = LogEnhancer()
tree = optimizer.visit(tree)

code = compile(tree, "<unknown>", "exec")
exec(code)
`

/**
 * Handle pyplot figures as a special case, drawing the figure as an image
 */
function isPlot(obj: any) {
  try {
    if (obj.__name__ === 'matplotlib.pyplot') {
      return true
    }
  } catch {
    return false
  }
}

export type TransferableImage = {
  marker: '__rnwp_transferable_image__'
  buffer: Uint8ClampedArray
  width: number
  height: number
}

function extractImageData(plt: any): TransferableImage {
  plt.gcf().canvas.show()
  const canvas: DOMCanvasElement = plt.gcf().canvas.get_element('canvas')
  const image: ImageData = canvas.getContext().getImageData()
  const arrayBuffer = image.data

  return {
    marker: '__rnwp_transferable_image__',
    buffer: arrayBuffer,
    width: (canvas.attributes.width as number) || 0,
    height: (canvas.attributes.height as number) || 0,
  }
}

function handleMessage(message: PythonMessage): Promise<PythonResponse> {
  switch (message.type) {
    case 'init':
      return context.languagePluginLoader.then(() => {
        return {}
      })
    case 'run':
      return context.languagePluginLoader.then(() => {
        const { code, requestId } = message
        const pyodide = context.pyodide

        if (!context.__variables__) {
          context.__variables__ = context.pyodide.runPython(
            `list(globals().keys())`
          ) as string[]
        } else {
          reset()
          pyodide.runPython(DeleteGlobals)
        }

        // We expose the current source code and special logging function as globals, since
        // that seems to be the easiest way to pass variables into the code after our AST transformation
        context.__source__ = code
        context.__log__ = (line: number, col: number, ...args: unknown[]) => {
          const logs = args.map((arg, index) =>
            isPlot(arg)
              ? extractImageData(arg)
              : typeof arg === 'function'
              ? pyodide.globals.repr(arg)
              : arg
          )

          context.postMessage({
            type: 'log',
            payload: { line, col, logs, requestId },
          })
        }
        return findAndLoadImports(pyodide).then(() => {
          try {
            pyodide.runPython(ConsoleLogTransformer)
          } catch (error) {
            const message = formatPythonError(error as Error)
            if (message) {
              context.postMessage({
                type: 'error',
                payload: {
                  requestId,
                  message,
                },
              })
            }
          }

          return {}
        })
      })
  }
}

const FindImports = `
import ast
import js
import sys

def find_imports(code):
  mod = ast.parse(code)
  imports = set()
  for node in ast.walk(mod):
    if isinstance(node, ast.Import):
      for name in node.names:
        name = name.name
        imports.add(name.split(".")[0])
    elif isinstance(node, ast.ImportFrom):
      name = node.module
      imports.add(name.split(".")[0])
  return list(imports.difference(sys.builtin_module_names))

find_imports(js.globalThis.__source__)
`

/**
 * Scan the global __source__ for imports and load them.
 *
 * We can't use the built-in functionality for doing this, since we apply an AST transformation
 * before running the code, and we can't generate source code from the transformed AST. The API
 * for scanning imports isn't public
 */
function findAndLoadImports(pyodide: Pyodide): Promise<void> {
  const findImports = () => {
    try {
      // Any errors thrown here will also be thrown when running the code.
      // We'll ignore the error here and handle it later instead.
      return pyodide.runPython(FindImports) as string[]
    } catch (e) {
      return []
    }
  }

  const newImports = findImports()
    .map((name) => pyodide._module.packages.import_name_to_package_name[name])
    .filter((name) => name && !(name in pyodide.loadedPackages))

  return pyodide.loadPackage(newImports)
}

const errorRe = /File "<unknown>", line (\d+)/

function formatPythonError(error: Error): string | undefined {
  const message = error.message
  const match = message.match(errorRe)

  if (!match) return

  const lineNumber = match[1]
  const lines = message.split('\n')
  const summary = lines[lines.length - 2]

  return `${summary} (${lineNumber})\n\n${lines.slice(0, -2).join('\n')}`
}

interface PythonMessageEvent extends MessageEvent {
  data: { id: string; payload: PythonMessage }
}

onmessage = (e: PythonMessageEvent) => {
  const { id, payload } = e.data

  handleMessage(payload).then((message) => {
    context.postMessage({
      id,
      payload: message,
    })
  })
}
