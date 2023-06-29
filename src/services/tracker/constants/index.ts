import type { CreateDailyTrackerSchema } from "../../../schemas/tracker"

export const INIT_TRACKER: CreateDailyTrackerSchema = {
  fields: [],
  entries: [],
}

export const FIELDS_SHEET_NAME = 'Fields'
export const ENTRIES_SHEET_NAME = 'Entries'