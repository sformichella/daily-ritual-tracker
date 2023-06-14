import { existsSync, readFileSync, statSync } from 'fs'

import { z } from 'zod'

import { PathSchema } from '../../reference'
import { DailyEntrySchema, DailyTrackerSchema } from '..'

export const mustExist = (path: PathSchema, ctx: z.RefinementCtx) => {
  const parsed = path.join('/')

  const exists = existsSync(parsed)

  if(!exists) {
    ctx.addIssue({
      code: 'custom',
      fatal: true,
      message: `${parsed} does not exist`
    })

    return
  }
}

export const mustBeJSON = (path: PathSchema, ctx: z.RefinementCtx) => {
  const parsed = path.join('/')

  const data = readFileSync(parsed).toString()

  try {
    return JSON.parse(data)
  } catch(err) {
    const error = err as Error

    ctx.addIssue({
      code: 'custom',
      fatal: true,
      message: `Failed to parse ${parsed} as JSON`,
      params: {
        error: error.message,
        stack: error.stack
      }
    })
  }
}

export const mustBeFile = (path: PathSchema, ctx: z.RefinementCtx) => {
  const parsed = path.join('/')

  const stats = statSync(parsed)

  if(stats.isDirectory()) {
    ctx.addIssue({
      code: 'custom',
      fatal: true,
      message: `${parsed} is a directory`
    })

    return
  }
}

export const fieldMustExist = (data: [data: DailyTrackerSchema, entry: DailyEntrySchema], ctx: z.RefinementCtx) => {
  const [{ fields }, entry] = data

  const matched = fields.filter((f) => f.name === entry.field)

  if(matched.length === 0) {
    ctx.addIssue({
      code: 'custom',
      fatal: true,
      message: `${entry.field} not found`
    })
  }

  return matched
}
