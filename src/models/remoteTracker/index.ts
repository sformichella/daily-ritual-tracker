import { OAuth2Client } from 'google-auth-library'
import { GoogleSpreadsheet } from 'google-spreadsheet'

import { Reference } from '../reference'

import type { DailyTrackerSchema } from '../../schemas/tracker'

import {
  createEntriesData,
  createFieldsData,
  setCells
} from './utils'

import {
  FIELDS_SHEET_NAME,
  ENTRIES_SHEET_NAME
} from './constants'

export const createRemoteTracker = async (authClient: OAuth2Client, ref: Reference, data: DailyTrackerSchema) => {
  const sheet = new GoogleSpreadsheet()
  sheet.useOAuth2Client(authClient)

  const result = await sheet.createNewSpreadsheetDocument({
    title: data.name
  }).catch((error) => {
    console.log('Failed to create sheet')
    return error as Error // Assume it's an error for now
  })

  if(result instanceof Error) {
    return result
  }

  const [fieldsSheet, entriesSheet] = await Promise.all([
    await sheet.addWorksheet({ title: FIELDS_SHEET_NAME }),
    await sheet.addWorksheet({ title: ENTRIES_SHEET_NAME })
  ])

  await Promise.all([
    fieldsSheet.loadCells(),
    entriesSheet.loadCells()
  ])

  setCells(fieldsSheet, createFieldsData(data))
  setCells(entriesSheet, createEntriesData(data))

  const defaultSheet = Object.values(sheet.sheetsById)[0]

  await Promise.all([
    entriesSheet.saveUpdatedCells(),
    fieldsSheet.saveUpdatedCells(),
    defaultSheet.delete()
  ])

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

  const {
    [FIELDS_SHEET_NAME]: fieldsSheet,
    [ENTRIES_SHEET_NAME]: entriesSheet
  } = sheet.sheetsByTitle

  if(fieldsSheet === undefined || entriesSheet === undefined) {
    return new Error('Fa')
  }

  return sheet
}
