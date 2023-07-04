import { REPLServer } from "repl"
import chalk from 'chalk'
import { Just, Nothing, Maybe, MaybeAsync, EitherAsync, Either, Right, Left } from 'purify-ts'

import type { Credentials, OAuth2Client } from "google-auth-library"

import { writeTracker } from "../../../models/tracker"
import { createRemoteTracker, updateRemoteTracker } from "../../../models/remoteTracker"
import { client, getAuthdClient, constants } from '../../../services/auth'
import { Session, question } from "../../utils"
import { FIVE_MINUTES, OAUTH_TOKENS_CACHE_KEY } from './constants'

const getAuthorizationToken = () => {
  const cached = process.env[OAUTH_TOKENS_CACHE_KEY]
  if(cached) return Just(JSON.parse(cached) as Credentials)
  return Nothing
}

const refreshAuthorizationToken = async (creds: Credentials) => {
  if(creds.expiry_date && creds.expiry_date > Date.now() + FIVE_MINUTES) {
    return client.refreshAccessToken().then(({ credentials }) => Right(credentials))
  }

  return Right(creds)
}

const createAuthorizationToken = () => {

}

const authorize = async (repl: REPLServer): Promise<OAuth2Client | Error> => {
  const askToGenerateNewAuthTokens = () => {
    const proceedQuery = 'Opening a browser window for authentication...'
      + '\n\n' + 'Would you like to proceed? (Y/n): '

    return MaybeAsync.fromPromise(() => question(repl, proceedQuery).then(Just))
  }

  const parseAnswer = (answer: string): Either<'n', 'y'> => {
    if(answer === 'y') return Right('y')
    return Left('n')
  }

  const askGen = (): MaybeAsync<string> => askToGenerateNewAuthTokens()
    .ifJust((a) => {
      return EitherAsync
        .liftEither(parseAnswer(a))
        .ifLeft(() => askGen())
    })

  const asdfd = (c: Credentials) => {

    const proceed = await 
  
    console.log()
  
    if(proceed !== 'y') {
      return new Error('Failed to authorize.')
    }
  
    console.log(chalk.green('Authorizing...') + '\n')  

    tokens = await getAuthdClient()

    console.log(chalk.green('Successfully signed in.') + '\n')
  }

  // Validate credentials
  const scopes = tokens.scope?.split(' ') || []

  if(!scopes.includes(constants.SHEETS_ACCESS_SCOPE)) {
    const message = chalk.red('Permission denied to access Google Sheets on your behalf.')
      + '\n\n'
      + chalk.bold('REASON: ')
      + `OAuth scope "${constants.SHEETS_ACCESS_SCOPE}" not found in OAuth client credentials after sign-in.`
      + '\n'
      + 'Unable to access Google Sheets without this scope.'
      + '\n'

    console.log(message)

    const tryAgainMessage = 'Would you like to try signing in again? (Y/n): '
    const tryAgain = await question(repl, tryAgainMessage).then((answer) => answer.trim().toLowerCase())

    console.log('\n')

    if(tryAgain !== 'y') {
      return new Error('Failed to authorize.')
    }

    return authorize(repl)
  }

  // Cache & set credentials
  process.env[OAUTH_TOKENS_CACHE_KEY] = JSON.stringify(tokens)

  client.setCredentials(tokens)

  return client
}

export const exportTracker = async (repl: REPLServer, session: Session | undefined) => {
  console.log()

  // checkActiveSession
  if(session === undefined) {
    console.error('Start a new session with ".load" or ".new" to use this command.\n')
    return
  }

  const client = await authorize(repl)

  if(client instanceof Error) {
    const message = chalk.red(client.message)
      + '\n\n'
      + chalk.red('Tracker was not succesfully exported.')
      + '\n'

    console.log(message)

    return
  }

  const spreadsheetId = session.data.spreadsheetId

  if(spreadsheetId === undefined) {
    console.log(chalk.yellow('Remote tracker not found. Creating...') + '\n')

    const sheet = await createRemoteTracker(client, session.ref, session.data)

    if(sheet instanceof Error) {
      console.log(chalk.red('Failed to create remote tracker') + '\n')
      return
    }

    session.data.spreadsheetId = sheet.spreadsheetId

    writeTracker(session.ref, session.data)

    console.log(chalk.green('Done.') + '\n')

    return
  }

  console.log(chalk.yellow('Updating remote tracker...') + '\n')

  await updateRemoteTracker(client, session.data, spreadsheetId)

  console.log(chalk.green('Done.') + '\n')
}