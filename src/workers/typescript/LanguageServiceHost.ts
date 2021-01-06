import * as ts from 'typescript'
import { exists, writeFile, getFile, getPaths } from './fileSystem'
import { fs } from './system'

type TSLanguageServiceHost = Parameters<typeof ts.createLanguageService>[0]

export default class LanguageServiceHost implements TSLanguageServiceHost {
  constructor(public compilerOptions: ts.CompilerOptions) {}

  versions: Record<string, string> = {}

  fileExists(fileName: string) {
    return exists(fs, fileName)
  }

  addFile(fileName: string, text: string, version?: string) {
    version = version
      ? version
      : getFile(fs, fileName)
      ? String(Number(this.versions[fileName]) + 1)
      : '1'

    writeFile(fs, fileName, text)

    this.versions[fileName] = version
  }

  // Implementation of ts.LanguageServiceHost

  getCompilationSettings(): ts.CompilerOptions {
    return {
      target: ts.ScriptTarget.ES5,
      module: ts.ModuleKind.CommonJS,
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
      jsx: ts.JsxEmit.React,
      ...this.compilerOptions,
    }
  }

  getScriptFileNames() {
    return getPaths(fs).filter((name) => exists(fs, name))
  }

  getScriptVersion(fileName: string) {
    return this.versions[fileName]
  }

  getScriptSnapshot(fileName: string) {
    return ts.ScriptSnapshot.fromString(getFile(fs, fileName) || '')
  }

  getCurrentDirectory() {
    return '/'
  }

  getDefaultLibFileName(options: ts.CompilerOptions) {
    return ts.getDefaultLibFileName(options)
  }
}
