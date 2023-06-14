import type { REPLServer } from "repl"
import { existsSync, mkdirSync, statSync } from "fs"

import { APP_DIR } from "../../constants"
import { ActiveSession, InitialSession } from "../../services/tracker"

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

export const initialAction = (repl: REPLServer, session: { current: InitialSession | ActiveSession }, action: (session: InitialSession, name: string) => void) => {
  return (input: string) => {
    if(session.current instanceof ActiveSession) {
      console.error('Already in an active session')
      repl.displayPrompt()
      return
    }

    action(session.current, input)
    repl.displayPrompt()
  }
}

export const activeAction = (repl: REPLServer, session: { current: InitialSession | ActiveSession }, action: (session: ActiveSession, input: string) => void) => {
  return (input: string) => {
    if(session.current instanceof InitialSession) {
      console.error('Already in an active session')
      repl.displayPrompt()
      return
    }

    action(session.current, input)
    repl.displayPrompt()
  }
}

export const questionWithRetry = (query: string, callback: (answer: string) => boolean) => {
  return [
    query,
    (answer: string) => {
      const proceed = callback(answer)

      if(proceed) {
        return
      }
    }
  ]
}
