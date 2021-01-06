import * as ts from 'typescript'
import {
  create,
  Directory,
  getFile,
  getDirectory,
  makeDirectory,
  hasDirectory,
  hasFile,
  locate,
  contains,
} from './fileSystem'

export const fs: Directory = create()

export const system: ts.System = {
  newLine: '\n',
  args: [],
  useCaseSensitiveFileNames: true,
  getCurrentDirectory: () => '/',
  getExecutingFilePath: () => '/',
  readDirectory: (filepath) => {
    // console.info(`readDirectory`, filepath)
    const directory = getDirectory(fs, filepath)
    if (!directory) return []
    return Object.keys(directory)
  },
  readFile: (filepath) => {
    // console.info(`readFile`, filepath)
    return getFile(fs, filepath)
  },
  write: (s: string) => {
    // console.info(`write`, s)
    console.log(`write: ${s}`)
  },
  writeFile: (filepath, data) => {
    // console.info(`writeFile`, filepath)
    const target = locate(fs, filepath)
    if (!target) return
    return (target.parent[target.name] = data)
  },
  resolvePath: (filepath) => {
    // console.info(`resolvePath`, filepath)
    return filepath
  },
  getDirectories: (filepath) => {
    // console.info(`getDirectories`, filepath)
    const directory = getDirectory(fs, filepath)
    if (!directory) return []
    return Object.keys(directory).filter((name) => contains(directory, name))
  },
  createDirectory: (filepath) => {
    // console.info(`createDirectory`, filepath)
    makeDirectory(fs, filepath)
  },
  directoryExists: (filepath) => {
    // console.info(`directoryExists`, filepath)
    const target = locate(fs, filepath)
    if (!target) return false
    return hasDirectory(target.parent, target.name)
  },
  fileExists: (filepath) => {
    // console.info(`fileExists`, filepath)
    const target = locate(fs, filepath)
    if (!target) return false
    return hasFile(target.parent, target.name)
  },
  exit: () => {
    // console.info(`exit`)
    throw new Error('EXIT')
  },
}
