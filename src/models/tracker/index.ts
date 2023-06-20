import { Reference } from '../reference'
import { DailyTrackerSchema } from '../../schemas/tracker'

export const writeTracker = (ref: Reference, tracker: DailyTrackerSchema) => {
  ref.set(JSON.stringify(tracker))
  return
}

/**
 * Read the contents of the reference
 * 
 * Assumes that the return value is {@link DailyTrackerSchema}
 */
export const readTracker = (ref: Reference) => {
  return JSON.parse(ref.get().toString()) as DailyTrackerSchema
}
