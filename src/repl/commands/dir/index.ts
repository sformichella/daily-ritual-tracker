import { REPLServer } from 'repl'
import chalk from 'chalk'

import { APP_DIR } from "../../../constants"

export const dir = (repl: REPLServer) => {
  console.log('The current storage directory is: ')
  console.log(chalk.bold(`\n  ${APP_DIR.join('\\')}\n`))
  repl.displayPrompt()
  return
}
