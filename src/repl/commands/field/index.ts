import { Stack } from '../../stack'

import { addField } from '../../../services/tracker'

import {
  ActiveSessionArgs,
  checkActiveSession,
  terminate
} from '../utils'

type EnterFieldArgs = [...session: ActiveSessionArgs, fieldName: string]
type EnterDescriptionArgs = [...fieldArgs: EnterFieldArgs, description: string]

const enterFieldName = (next: (args: EnterFieldArgs) => void) => {
  return ([repl, session]: ActiveSessionArgs) => {
    const query = 'Enter a name for your new field: '

    repl.question(query, (answer: string) => {
      return next([repl, session, answer])
    })
  }
}

const enterDescription = (next: (args: EnterDescriptionArgs) => void) => {
  return ([repl, session, field]: EnterFieldArgs) => {
    const query = 'Enter a description for your field: '

    repl.question(query, (answer: string) => {
      return next([repl, session, field, answer])
    })
  }
}

const updateTracker = (next: (args: ActiveSessionArgs) => void) => {
  return ([repl, session, field, description]: EnterDescriptionArgs) => {
    session.data = addField(session.data, {
      name: field,
      description
    })

    return next([repl, session])
  }
}

export const field = new Stack(checkActiveSession)
  .push(enterFieldName)
  .push(enterDescription)
  .push(updateTracker)
  .push(terminate)
  .get()
