import { readdirSync } from 'fs'

import {
  DailyEntrySchema,
  DailyTrackerSchema,
  FieldSchema,
  ValidateAddEntry,
  ValidateRead
} from '../../schemas/tracker'

import {
  Reference,
  reference
} from '../../models/reference'

import {
  createTracker,
  readTracker,
  writeTracker
} from '../../models/tracker'

import { APP_DIR } from '../../constants'

export class InitialSession {
  ref: Reference | undefined

  constructor() {
    this.ref = undefined
  }

  new(name: string) {
    const ref = createTracker(name)
    return new ActiveSession(ref)
  }

  load(name: string) {
    const loaded = findByName(name)
    if(loaded === undefined) return loaded
    return new ActiveSession(loaded)
  }
}

export class ActiveSession {
  ref: Reference
  data: DailyTrackerSchema

  constructor(ref: Reference) {
    this.ref = ref
    this.data = readTracker(ref)
  }

  save() {
    writeTracker(this.ref, this.data)
  }

  exit() {
    this.save()
    return new InitialSession()
  }

  addField(field: FieldSchema) {
    const updated: DailyTrackerSchema = {
      ...this.data,
      fields: [
        ...this.data.fields,
        field
      ]
    }
    
    this.data = updated

    return this
  }

  addEntry(entry: DailyEntrySchema) {
    const parsed = ValidateAddEntry.safeParse([this.data, entry])

    if(!parsed.success) return parsed.error

    const matched = parsed.data
    
    if(matched.length === 1) {
      this.data = {
        ...this.data,
        entries: [
          ...this.data.entries,
          entry
        ]
      }
  
      return this
    }

    return this
  }
}

function findByName(name: string) {
  const appDir = APP_DIR.join('/')

  const contents = readdirSync(appDir)

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
