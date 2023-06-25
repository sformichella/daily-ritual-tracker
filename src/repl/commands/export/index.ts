import { REPLServer } from "repl"
import chalk from 'chalk'

import { client, getAuthdClient } from '../../../services/auth'

import { Session, question } from "../../utils"
import { createRemoteTrakcer, updateRemoteTracker } from "../../../services/tracker"

export const getClient = async () => {
  const cacheKey = 'auth_token_cache'

  const cache = process.env[cacheKey]

  if(cache !== undefined) {
    return client
  }

  const tokens = await getAuthdClient()
  process.env[cacheKey] = JSON.stringify(tokens)
  client.setCredentials(tokens)
  return client
}

export const exportTracker = async (repl: REPLServer, session: Session | undefined) => {
  // checkActiveSession
  if(session === undefined) {
    console.error('Start a new session with ".load" or ".new" to use this command.')
    repl.displayPrompt()
    return
  }

  const proceedQuery = 'Opening a browser window for authentication...'
    + '\n\n' + 'Would you like to proceed? (Y/n): '
  const proceed = await question(repl, proceedQuery).then((answer) => answer.trim().toLowerCase())

  if(proceed !== 'y') {
    console.log(chalk.red('\nCancelling tracker export\n'))
    return
  }

  const client = await getClient()

  const spreadsheetId = session.data.spreadsheetId

  if(spreadsheetId === undefined) {
    const sheet = await createRemoteTrakcer(client, session.ref, session.data)

    if(sheet instanceof Error) {
      console.log(chalk.red('Failed to create remote tracker'))
      return
    }

    session.data.spreadsheetId = sheet.spreadsheetId

    return
  }

  const sheet = await updateRemoteTracker(client, session.data, spreadsheetId)
  console.log('Update not implemented');
}