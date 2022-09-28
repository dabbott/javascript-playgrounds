import flatMap from 'array.prototype.flatmap'
import { path } from 'imfs'
import matchAll from 'string.prototype.matchall'

interface IFetch {
  (url: string): Promise<Response>
}

type LibraryVersions = {
  '@openzeppelin/contracts': string
  'gwei-slim-nft-contracts': string
}

// eslint-disable-next-line no-useless-escape
const importRe = /import\s+?(?:\{.*?\}\s+?from\s+?)?(?:'|")([@A-Za-z0-9_\-\/\.]+)(?:'|")/gm

export function parseImports(source: string) {
  const result = matchAll(source, importRe)

  return [...result].map((match) => match[1])
}

export function normalizeImport(parentName: string, name: string) {
  const parentDir = path.dirname(parentName)

  if (!name.startsWith('@')) {
    return path.join(parentDir, name)
  } else {
    return name
  }
}

export function getContractURI(importPath: string, versions?: LibraryVersions) {
  if (versions) {
    const parts = importPath.split(path.sep)

    // [ '@openzeppelin', 'contracts', 'token', 'ERC721', 'ERC721.sol' ]
    if (parts[0].startsWith('@')) {
      parts[1] += `@${versions['@openzeppelin/contracts']}`
    } else {
      parts[0] += `@${versions['gwei-slim-nft-contracts']}`
    }

    importPath = parts.join(path.sep)
  }

  return `https://unpkg.com/${importPath}`
}

export async function fetchFile(
  fetch: IFetch,
  importPath: string,
  versions?: LibraryVersions
): Promise<string> {
  const contractURI = getContractURI(importPath, versions)
  const result = await fetch(contractURI)
  const text = await result.text()
  return text
}

type DownloadedFile = {
  importPath: string
  source: string
  imports: string[]
}

export async function downloadFile(
  fetch: IFetch,
  importPath: string,
  versions?: LibraryVersions
): Promise<DownloadedFile> {
  const source = await fetchFile(fetch, importPath, versions)

  return {
    importPath,
    source,
    imports: parseImports(source),
  }
}

export async function downloadDependencies(
  fetch: IFetch,
  initialImports: string[],
  versions?: LibraryVersions
): Promise<Record<string, string>> {
  const files: Record<string, string> = {}

  const remaining = [...initialImports]

  while (remaining.length > 0) {
    const downloadedFiles = await Promise.all(
      remaining.map((importPath) => downloadFile(fetch, importPath, versions))
    )

    remaining.length = 0

    downloadedFiles.forEach(({ importPath, source }) => {
      files[importPath] = source
    })

    const resolvedImports = flatMap(
      downloadedFiles,
      ({ importPath: parentPath, imports }) =>
        imports.map((importPath) => normalizeImport(parentPath, importPath))
    ).filter((name) => !(name in files))

    remaining.push(...resolvedImports)
  }

  return files
}

export async function downloadDependenciesForSource(
  fetch: IFetch,
  importPath: string,
  source: string,
  versions?: LibraryVersions
): Promise<Record<string, string>> {
  console.log('deps', source)

  const files = await downloadDependencies(
    fetch,
    parseImports(source),
    versions
  )

  return {
    [importPath]: source,
    ...files,
  }
}
