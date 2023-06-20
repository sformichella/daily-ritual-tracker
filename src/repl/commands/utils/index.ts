import { REPLServer } from "repl";
import { Session } from "../../utils";

export type InitialSessionArgs = [repl: REPLServer, session: undefined]
export type ActiveSessionArgs = [repl: REPLServer, session: Session]

export const checkInitialSession = (next: (args: InitialSessionArgs) => void) => {
  return ([repl, session]: [REPLServer, Session | undefined]) =>{
    if(session !== undefined) {
      console.error('Already in an active session.')
      repl.displayPrompt()
      return 
    }

    return next([repl, session])
  }
}

export const checkActiveSession = (next: (args: ActiveSessionArgs) => void) => {
  return ([repl, session]: [REPLServer, Session | undefined]) =>{
    if(session === undefined) {
      console.error('Start a new session with ".load" or ".new" to use this command.')
      repl.displayPrompt()
      return 
    }

    return next([repl, session])
  }
}

export const terminate = (next: any) => {
  return ([repl]: [REPLServer, ...any[]]) => {
    repl.displayPrompt()
    return
  }
}
