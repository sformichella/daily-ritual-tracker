import { REPLServer } from 'repl'
import { addField } from '../../../services/tracker'
import { Session, question } from '../../utils'

const enterFieldName = (repl: REPLServer) => {
  return question(repl, 'Enter a name for your new field: ')
}

const enterFieldDescription = (repl: REPLServer) => {
  return question(repl, 'Enter a description for your field: ')
}

export const field = async (repl: REPLServer, session: Session | undefined) => {
  // checkActiveSession
  if(session === undefined) {
    console.error('Start a new session with ".load" or ".new" to use this command.')
    repl.displayPrompt()
    return
  }

  const fieldName = await enterFieldName(repl)
  const fieldDescription = await enterFieldDescription(repl)

  // updateTracker
  session.data = addField(session.data, {
    name: fieldName,
    description: fieldDescription
  })

  console.log()

  return
}
