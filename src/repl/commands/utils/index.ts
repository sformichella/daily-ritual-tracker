import { REPLServer } from "repl";

import {
  ActiveSession,
  InitialSession
} from "../../../services/tracker";

export type InitialSessionArgs = [repl: REPLServer, session: InitialSession]
export type ActiveSessionArgs = [repl: REPLServer, session: ActiveSession]

export const checkInitialSession = (next: (args: InitialSessionArgs) => void) => {
  return ([repl, session]: [REPLServer, { current: ActiveSession | InitialSession }]) =>{
    if(session.current instanceof ActiveSession) {
      console.error('Already in an active session.')
      repl.displayPrompt()
      return 
    }

    return next([repl, session.current])
  }
}

export const checkActiveSession = (next: (args: ActiveSessionArgs) => void) => {
  return ([repl, session]: [REPLServer, { current: ActiveSession | InitialSession }]) =>{
    if(session.current instanceof InitialSession) {
      console.error('Start a new session with ".load" or ".new" to use this command.')
      repl.displayPrompt()
      return 
    }

    return next([repl, session.current])
  }
}

export const terminate = (next: any) => {
  return ([repl]: [REPLServer, ...any[]]) => {
    repl.displayPrompt()
    return
  }
}
