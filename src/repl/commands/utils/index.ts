import { REPLServer } from "repl";
import { ActiveSession, InitialSession } from "../../../services/tracker";

export const terminate = (next: (...args: any[]) => void) => {
  return ([repl]: [REPLServer, ...any[]]) => {
    repl.displayPrompt()
    return
  }
}

export const checkInitialSession = (next: ([repl, session]: [REPLServer, InitialSession]) => void) => {
  return ([repl, session]: [REPLServer, { current: ActiveSession | InitialSession }]) =>{
    if(session.current instanceof ActiveSession) {
      console.error('Already in an active session.')
      repl.displayPrompt()
      return 
    }

    return next([repl, session.current])
  }
}

export const checkActiveSession = (next: ([repl, session]: [REPLServer, ActiveSession]) => void) => {
  return ([repl, session]: [REPLServer, { current: ActiveSession | InitialSession }]) =>{
    if(session.current instanceof InitialSession) {
      console.error('Start a new session with ".load" or ".new" to use this command.')
      repl.displayPrompt()
      return 
    }

    return next([repl, session.current])
  }
}

