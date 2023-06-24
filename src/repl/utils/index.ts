import { existsSync, mkdirSync, statSync } from "fs"
import type { REPLServer } from "repl"
import chalk from "chalk"

import { DailyTrackerSchema } from "../../schemas/tracker"
import { Reference } from "../../models/reference"
import { APP_DIR } from "../../constants"

export type Session = {
  name: string
  ref: Reference
  data: DailyTrackerSchema
}

export const ensureAppDirectory = () => {
  const path = APP_DIR.join('/')

  const exists = existsSync(path)

  if(!exists) {
    mkdirSync(path)
    return
  }

  const stats = statSync(path)

  if(!stats.isDirectory()) {
    throw new Error(`App directory ${path} exists but it is not directory`)
  }
}

export const question = (repl: REPLServer, query: string) => {
  return new Promise<string>((res) => repl.question(query, res))
}

export const displaySession = (session: Session | undefined) => {
  if(session === undefined) {
    console.log(
      '\n'
      + `${chalk.bold('No session loaded.')}`
      + '\n' 
      + '\n'
      + `Use ${chalk.bold('.new <name>')} to create a new tracker`
      + '\n'
      + `Use ${chalk.bold('.load <name>')} to load an existing tracker`
      + '\n'
    )

    return
  }

  console.log(
    '\n'
    + `Loaded: ${chalk.bold(session.name)}`
    + '\n'
  )

  return
}

export const splash = () => {
  console.clear()
  
  const bar = '--------'

  console.log(
    bar.repeat(7)
    + '\n'
    + `${bar.repeat(2)}  ${chalk.bold('Daily Ritual Tracker')}  ${bar}${bar}`
    +'\n'
    + bar.repeat(7)
    + '\n'
  )
}
