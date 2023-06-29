import type { GoogleSpreadsheetWorksheet } from "google-spreadsheet"

import {
  DailyTrackerSchema,
  FieldSchema,
  DailyEntrySchema
} from "../../../schemas/tracker"

export const createFieldsData = (tracker: DailyTrackerSchema) => {
  const fieldsInit = [Object.keys(FieldSchema.shape)] as readonly [
    Array<keyof typeof FieldSchema.shape>,
    ...string[][]
  ]

  return tracker.fields.reduce((cells, field) => {
    const [headers] = cells
    const row = headers.map((header) => field[header])
    return [...cells, row] as const
  }, fieldsInit)

}

export const createEntriesData = (tracker: DailyTrackerSchema) => {
  const entriesInit = [Object.keys(DailyEntrySchema.shape)] as readonly [
      Array<keyof typeof DailyEntrySchema.shape>, 
      ...(string | number)[][]
    ]

  return tracker.entries.reduce((cells, entry) => {
    const [headers] = cells
    const row = headers.map((header) => entry[header])
    return [...cells, row] as const
  }, entriesInit)

}

export const setCells = (sheet: GoogleSpreadsheetWorksheet, data: readonly any[][]) => {
  data.forEach((row, rowIndex) => {
    row.forEach((value, columnIndex) => {
      sheet.getCell(rowIndex, columnIndex).value = value
    })
  })
}
