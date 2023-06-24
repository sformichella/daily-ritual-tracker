import { isBuiltin } from 'node:module'

const isLocal = (path = '') => path[0] === '.'
const isDirImport = (path = '') => !path.endsWith('.js')

export const resolve = (specifier, context, nextResolve) => {
  if(isBuiltin(specifier) || !isLocal(specifier) || !isDirImport(specifier)) {
    return nextResolve(specifier, context)
  }

  return nextResolve(`${specifier}/index.js`, context)
}
