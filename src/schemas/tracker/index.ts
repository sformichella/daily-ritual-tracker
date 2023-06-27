import { z } from 'zod'

import { ALPHA_NUMERIC_REGEX } from '../constants'
import { PathSchema } from '../reference';
import { fieldMustExist, mustBeFile, mustBeJSON, mustExist } from './utils';

const MIN_NAME_LENGTH = 3
const MM_DD_YYYY_REGEX = /[0-9]/

/**
 * Simplifies intersection types 
 * 
 * @example 
 * // Turns this type
 * { name: string } & { field: string }
 * 
 * // Into this type
 * { name: string, field: string }
 */
export type Simplify<T> = T extends object ? {
  [K in keyof T]: Simplify<T[K]>
} : T;

export const NameSchema = z.string()
  .regex(ALPHA_NUMERIC_REGEX, {
    message: `Name failed to parsed. Only alphanumeric characters, underscores, and hyphens are allowed.`
  })
  .min(MIN_NAME_LENGTH, {
    message: `Tracker name must be at least ${MIN_NAME_LENGTH} characters`
  })

export const FieldSchema = z.object({
  name: z.string(),
  description: z.string()
})

export const DailyEntrySchema = z.object({
  field: z.string(),
  value: z.string(),
  description: z.string(),
  time: z.number()
})

export const CreateDailyTrackerSchema = z.object({
  fields: FieldSchema.array(),
  entries: DailyEntrySchema.array()
})

export const DailyTrackerSchema = z.object({
  id: z.string().uuid(),
  spreadsheetId: z.string().optional(),
  name: NameSchema,
}).and(CreateDailyTrackerSchema)

export type NameSchema = z.infer<typeof NameSchema>
export type FieldSchema = Simplify<z.infer<typeof FieldSchema>>
export type DailyEntrySchema = Simplify<z.infer<typeof DailyEntrySchema>>
export type DailyTrackerSchema = Simplify<z.infer<typeof DailyTrackerSchema>>
export type CreateDailyTrackerSchema = Simplify<z.infer<typeof CreateDailyTrackerSchema>>

export const ValidateRead = PathSchema
  .superRefine(mustExist)
  .superRefine(mustBeFile)
  .transform(mustBeJSON)
  .pipe(DailyTrackerSchema)

export const ValidateAddEntry = z.tuple([DailyTrackerSchema, DailyEntrySchema])
  .transform(fieldMustExist)