import { decode, encode, QueryParameters } from './queryString'

export const getHashString = (): QueryParameters =>
  decode(window.location.hash.substring(1))

export const buildHashString = (params: QueryParameters = {}): string =>
  '#' + encode(params)
