import type * as ts from 'typescript'

// We don't want to accidentally import from ts and include it in the bundle,
// so we use a number instead of an enum for some options.
// TODO: Test if using just the enum increases bundle size.
const compilerOptions: ts.CompilerOptions = {
  target: 1, // ts.ScriptTarget.ES5,
  module: 1, // ts.ModuleKind.CommonJS,
  strict: true,
  strictNullChecks: true,
  strictFunctionTypes: true,
  strictPropertyInitialization: true,
  strictBindCallApply: true,
  noImplicitThis: true,
  noImplicitAny: true,
  alwaysStrict: true,
  esModuleInterop: true,
  experimentalDecorators: true,
  emitDecoratorMetadata: true,
  incremental: true,
  tsBuildInfoFile: '/.tsbuildinfo',
  jsx: 2, // ts.JsxEmit.React,
}

export default compilerOptions
