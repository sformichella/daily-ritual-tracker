import { readFileSync, writeFileSync } from 'fs'

import { PathSchema } from '../../schemas/reference'

const set = (path: PathSchema, data: string) => {
  writeFileSync(path.join('/'), data)
}

const get = (path: PathSchema) => {
  return readFileSync(path.join('/'))
}

export const reference = (path: PathSchema) => {
  const methods = {
    path,
    set: (data: string) => set(path, data),
    get: () => get(path)
  }

  return methods
}

export type Reference = ReturnType<typeof reference>
