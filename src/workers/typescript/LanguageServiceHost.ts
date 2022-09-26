import * as ts from 'typescript'
import { exists, getFile, getPaths, writeFile } from './fileSystem'
import { fs } from './system'

type TSLanguageServiceHost = Parameters<typeof ts.createLanguageService>[0]

export default class LanguageServiceHost implements TSLanguageServiceHost {
  constructor(public compilerOptions: ts.CompilerOptions) {}

  versions: Record<string, string> = {}

  readFile(
    fileName: string,
    encoding?: string | undefined
  ): string | undefined {
    return getFile(fs, fileName)
  }

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
    return this.compilerOptions
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
