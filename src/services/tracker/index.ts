import { readdirSync } from 'fs'
import { v4 as uuid } from 'uuid'

import { reference } from '../../models/reference'
import { writeTracker } from '../../models/tracker'

import {
  CreateDailyTrackerSchema,
  DailyTrackerSchema,
  DailyEntrySchema,
  FieldSchema,
  ValidateRead,
  NameSchema
} from '../../schemas/tracker'

import { APP_DIR, JSON_EXTENSION } from '../../constants'

const INIT_TRACKER: CreateDailyTrackerSchema = {
  fields: [],
  entries: [],
}

export const createTracker = (name: NameSchema) => {
  const id = uuid()

  const path = APP_DIR.concat(id.concat(JSON_EXTENSION))

  const ref = reference(path)

  const data: DailyTrackerSchema = {
    id,
    name,
    ...INIT_TRACKER,
  }

  writeTracker(ref, data)

  return ref
}

export {
  readTracker,
  writeTracker as updateTracker
} from '../../models/tracker'

export const findByName = (name: string) => {
  const dir = APP_DIR.join('/')

  const contents = readdirSync(dir)

  for(const file of contents) {
    const path = APP_DIR.concat([file])

    const parsed = ValidateRead.safeParse(path)

    if(!parsed.success) {
      console.debug(`Failed to parse file in app directory: ${path.join('/')}`)

      parsed.error.errors.forEach((error) => {
        console.debug('Parsing error', error)
      })

      continue
    }

    if(parsed.data.name === name) {
      return reference(path)
    }
  }
}

export const addField = (tracker: DailyTrackerSchema, field: FieldSchema) => {
  const updated: DailyTrackerSchema = {
    ...tracker,
    fields: [
      ...tracker.fields,
      field
    ]
  }

  return updated
}

export const addEntry = (tracker: DailyTrackerSchema, entry: DailyEntrySchema) => {
  const updated: DailyTrackerSchema = {
    ...tracker,
    entries: [
      ...tracker.entries,
      entry
    ]
  }

  return updated
}
