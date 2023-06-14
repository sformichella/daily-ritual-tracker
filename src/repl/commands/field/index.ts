import chalk from 'chalk'
import type { REPLServer } from 'repl'

import type { ActiveSession as Session } from '../../../services/tracker'
import { Stack } from '../../stack'
import { checkActiveSession, terminate } from '../utils'

const enterFieldName = (next: ([repl, session, field]: [REPLServer, Session, string]) => void) => {
  return ([repl, session]: [REPLServer, Session]) => {
    const query = 'Enter a name for your new field: '

    repl.question(query, (answer: string) => {
      return next([repl, session, answer])
    })
  }
}

const enterDescription = (next: ([repl, session, field, description]: [REPLServer, Session, string, string]) => void) => {
  return ([repl, session, field]: [REPLServer, Session, string]) => {
    const query = 'Enter a description for your field: '

    repl.question(query, (answer: string) => {
      return next([repl, session, field, answer])
    })
  }
}

const addField = (next: ([repl, session]: [REPLServer, Session]) => void) => {
  return ([repl, session, field, description]: [REPLServer, Session, string, string]) => {
    session.addField({
      name: field,
      description
    })

    return next([repl, session])
  }
}

export const field = new Stack(checkActiveSession)
  .push(enterFieldName)
  .push(enterDescription)
  .push(addField)
  .push(terminate)
  .get()
