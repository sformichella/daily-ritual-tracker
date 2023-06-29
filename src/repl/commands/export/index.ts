import { REPLServer } from "repl"
import chalk from 'chalk'

import type { Credentials, OAuth2Client } from "google-auth-library"

import { writeTracker } from "../../../models/tracker"
import { createRemoteTracker, updateRemoteTracker } from "../../../models/remoteTracker"

import { client, getAuthdClient } from '../../../services/auth'
import { SHEETS_ACCESS_SCOPE } from "../../../services/auth/constants"

import { Session, question } from "../../utils"

import { FIVE_MINUTES, OAUTH_TOKENS_CACHE_KEY } from './constants'

const getCredentials = async (cached?: Credentials) => {
  if(cached === undefined) {
    return getAuthdClient()
  }

  if(!cached.expiry_date || cached.expiry_date > Date.now() + FIVE_MINUTES) {
    return client.credentials
  }
  
  const { credentials } = await client.refreshAccessToken()

  return credentials
}

const authorize = async (repl: REPLServer, useCache = true): Promise<OAuth2Client | undefined> => {
  let cached: Credentials | undefined

  if(useCache && process.env[OAUTH_TOKENS_CACHE_KEY] !== undefined) {
    cached = JSON.parse(process.env[OAUTH_TOKENS_CACHE_KEY]) as Credentials
  }

  const tokens = await getCredentials(cached)

  const scopes = client.credentials.scope?.split(' ') || []

  if(!scopes.includes(SHEETS_ACCESS_SCOPE)) {
    const message = chalk.red('Permission denied to access Google Sheets on your behalf.')
      + '\n\n'
      + chalk.bold('REASON: ')
      + `OAuth scope "${SHEETS_ACCESS_SCOPE}" not found in OAuth client credentials after sign-in.`
      + '\n'
      + 'Unable to access Google Sheets without this scope.'
      + '\n'

    console.log(message)

    const tryAgainMessage = 'Would you like to try signing in again? (Y/n): '
    const tryAgain = await question(repl, tryAgainMessage).then((answer) => answer.trim().toLowerCase())

    console.log('\n')

    if(tryAgain !== 'y') {
      return
    }

    return authorize(repl)
  }

  process.env[OAUTH_TOKENS_CACHE_KEY] = JSON.stringify(tokens)

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

  console.log() // Print newline

  if(proceed !== 'y') {
    console.log('\n' + chalk.red('Cancelling tracker export') + '\n')
    return
  }

  console.log(chalk.green('Authorizing...') + '\n')

  const client = await authorize(repl)

  if(client === undefined) {
    const message = chalk.red('Failed to sign-in.')
      + '\n\n'
      + 'Tracker was not succesfully exported.'
      + '\n'

    console.log(message)

    return
  }

  console.log(chalk.green('Successfully signed in.') + '\n')

  const spreadsheetId = session.data.spreadsheetId

  if(spreadsheetId === undefined) {
    console.log(chalk.yellow('Remote tracker not found. Creating...') + '\n')

    const sheet = await createRemoteTracker(client, session.ref, session.data)

    if(sheet instanceof Error) {
      console.log(chalk.red('Failed to create remote tracker'))
      return
    }

    session.data.spreadsheetId = sheet.spreadsheetId

    writeTracker(session.ref, session.data)

    console.log(chalk.green('Done.') + '\n')

    return
  }

  console.log(chalk.yellow('Updating remote tracker...') + '\n')
  const sheet = await updateRemoteTracker(client, session.data, spreadsheetId)
  console.log('Update not implemented');
}