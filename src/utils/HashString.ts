import { decode, encode, QueryParameters } from './queryString'

export const getHashString = (): QueryParameters =>
  decode(window.location.hash.substring(1))

const buildHashString = (params: QueryParameters = {}): string =>
  '#' + encode(params)

export const setHashString = (fileMap: Record<string, string>) => {
  const filenames = Object.keys(fileMap)
  const multiFile = filenames.length > 1
  const code = fileMap[filenames[0]]

  const params: QueryParameters = {
    ...getHashString(),
    code,
  }

  // If there's no code in the editor, delete the code param
  if (!code) {
    delete params.code
  }

  // If we have multiple files, use the `files` param instead of `code`
  if (multiFile) {
    delete params.code

    const files = Object.keys(fileMap).map((filename) => [
      filename,
      fileMap[filename],
    ])
    params.files = JSON.stringify(files)
  }

  try {
    history.replaceState({}, '', `${buildHashString(params)}`)
  } catch (e) {
    // Browser doesn't support pushState
  }
}
