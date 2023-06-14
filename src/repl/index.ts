import * as console from 'console'
import { start } from 'repl'

import {
  InitialSession,
  ActiveSession
} from '../services/tracker'

import {
  initialAction,
  activeAction,
  ensureAppDirectory
} from './utils'

import { field, entry } from './commands'

import { APP_DIR } from '../constants'

export const repl = start()

ensureAppDirectory()

const sessions: { current: InitialSession | ActiveSession }  = {
  current: new InitialSession() 
}

repl.defineCommand('dir', () => {
  console.log('The current storage directory is: ')
  console.log(`\n  ${APP_DIR.join('\\')}\n`)
  repl.displayPrompt()
})

repl.defineCommand('new', {
  action: initialAction(repl, sessions, (current, name) => {
    sessions.current = current.new(name)
    repl.displayPrompt()
  })
})

repl.defineCommand('load', {
  action: initialAction(repl, sessions, (current, name) => {
    const loaded = current.load(name)

    if(loaded === undefined) {
      console.error(`No tracker found with name ${name}`)
      return
    }

    sessions.current = loaded
  })
})

repl.defineCommand('close', {
  action: activeAction(repl, sessions, (current, input) => {
    sessions.current = current.exit()
  })
})

repl.defineCommand('field', {
  action: () => field([repl, sessions])
})

repl.defineCommand('entry', {
  action: () => entry([repl, sessions])
})
