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

import {
  field,
  entry,
  dir
} from './commands'

export const repl = start()

ensureAppDirectory()

const sessions: { current: InitialSession | ActiveSession }  = {
  current: new InitialSession() 
}

// Commands that change the current session
// from Inital -> Active or vice versa

// Not sure how to implement these with a stack yet
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

// Commands for affecting the state of
// the current session
repl.defineCommand('dir', {
  action: () => dir([repl])
})

repl.defineCommand('field', {
  action: () => field([repl, sessions])
})

repl.defineCommand('entry', {
  action: () => entry([repl, sessions])
})
