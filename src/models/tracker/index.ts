import { v4 as uuid } from 'uuid'

import { reference, Reference } from '../reference'

import {
  CreateDailyTrackerSchema,
  DailyTrackerSchema,
  NameSchema,
} from '../../schemas/tracker'

import { JSON_EXTENSION } from '../constants'
import { APP_DIR } from '../../constants'

const INIT_TRACKER: CreateDailyTrackerSchema = {
  fields: [],
  entries: [],
}

export const writeTracker = (ref: Reference, tracker: DailyTrackerSchema) => {
  ref.set(JSON.stringify(tracker))
  return
}

export const createTracker = (name: NameSchema) => {
  const path = APP_DIR.concat(uuid().concat(JSON_EXTENSION))

  const ref = reference(path)

  const data: DailyTrackerSchema = {
    name,
    ...INIT_TRACKER,
  }

  writeTracker(ref, data)

  return ref
}

/**
 * Read the contents of the reference
 * 
 * Assumes that the return value is {@link DailyTrackerSchema}
 */
export const readTracker = (ref: Reference) => {
  return JSON.parse(ref.get().toString()) as DailyTrackerSchema
}
