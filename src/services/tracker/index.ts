import { readdirSync } from 'fs'
import { v4 as uuid } from 'uuid'
import { GoogleSpreadsheet } from 'google-spreadsheet'
import { OAuth2Client } from 'google-auth-library'

import { Reference, reference } from '../../models/reference'
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

const ROW_COLUMN_OFFSET = 3

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

export const createRemoteTrakcer = async (authClient: OAuth2Client, ref: Reference, data: DailyTrackerSchema) => {
  const sheet = new GoogleSpreadsheet()

  sheet.useOAuth2Client(authClient)

  const result = await sheet.createNewSpreadsheetDocument({
    title: data.name
  }).catch((error) => {
    console.log('Failed to create sheet', error.name)
    return new Error()
  })

  if(result instanceof Error) {
    return result
  }

  const [worksheet] = Object.values(sheet.sheetsById)

  await worksheet.loadCells()

  const fieldColumnIndex: { [name: string]: number } = {}

  data.fields.forEach((field, i) => {
    const cell = worksheet.getCell(ROW_COLUMN_OFFSET, ROW_COLUMN_OFFSET + i)
    fieldColumnIndex[field.name] = ROW_COLUMN_OFFSET + i
    cell.value = field.name
  })

  await worksheet.saveUpdatedCells()

  writeTracker(ref, { ...data, spreadsheetId: sheet.spreadsheetId })

  return sheet
}

export const getRemoteTracker = async (authClient: OAuth2Client, id: string) => {
  const sheet = new GoogleSpreadsheet(id)
  sheet.useOAuth2Client(authClient)
  await sheet.loadInfo()
  return sheet
}

export const updateRemoteTracker = async (authClient: OAuth2Client, data: DailyTrackerSchema, id: string) => {
  const sheet = new GoogleSpreadsheet(id)
  sheet.useOAuth2Client(authClient)
  return sheet
}
