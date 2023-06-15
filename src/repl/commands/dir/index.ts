import type { REPLServer } from "repl"
import chalk from 'chalk'

import { Stack } from "../../stack"
import { terminate } from "../utils"
import { APP_DIR } from "../../../constants"

const printStorageDirectory = (next: ([repl]: [REPLServer]) => void) => {
  return ([repl]: [REPLServer]) => {
    console.log('The current storage directory is: ')
    console.log(chalk.bold(`\n  ${APP_DIR.join('\\')}\n`))
    return next([repl])
  }
}

export const dir = new Stack(printStorageDirectory)
  .push(terminate)
  .get()
