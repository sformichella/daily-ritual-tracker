import chalk from 'chalk'
import type { REPLServer } from 'repl'

import type { ActiveSession as Session } from '../../../services/tracker'
import { Stack } from '../../stack'
import { checkActiveSession, terminate } from '../utils'

const TAB = '  '

const selectField = (next: ([repl, session, field]: [REPLServer, Session, string]) => void) => {
  return ([repl, session]: [REPLServer, Session]) => {
    const fields = session.data.fields

    if(fields.length === 0) {
      return terminate(next)([repl])
    }

    const display = fields.reduce((display, { name, description }) => {
      return display
        + '\n' + TAB + chalk.bold(name)
        + '\n\n' + TAB + TAB + `Description: "${description}"` + '\n'
    }, '\n')

    const query = `Select the field you want to add an entry to: ${display}` + '\nField: '

    repl.question(query, (answer: string) => {
      if(!fields.map((f) => f.name).includes(answer)) {
        const message = chalk.red(`"${answer}" is not one of the available fields`)
        console.log(message)
        return selectField(next)([repl, session])
      }

      return next([repl, session, answer])
    })
  }
}

const enterEntryValue = (next: ([repl, session, field, value]: [REPLServer, Session, string, string]) => void) => {
  return ([repl, session, field]: [REPLServer, Session, string]) => {
    const query = `Enter a value for "${field}": `

    repl.question(query, (answer: string) => {
      return next([repl, session, field, answer])
    })
  }
}

const optionalAddDescription = (next: ([repl, session, field, entry, description]: [REPLServer, Session, string, string, string]) => void) => {
  return ([repl, session, field, entry]: [REPLServer, Session, string, string]) => {
    const query = 'Would you like to add a description to this entry? (Y/n): '

    repl.question(query, (answer: string) => {
      const parsed = answer.trim().toLowerCase()

      if(parsed === 'y') {
        repl.question('Enter a description: ', (answer: string) => {
          return next([repl, session, field, entry, answer])
        })
      }

      else if(parsed === 'n') {
        return next([repl, session, field, entry, ''])
      }

      else {
        console.log(chalk.red('Please answer with "y" or "n"\n'))
        return optionalAddDescription(next)([repl, session, field, entry])
      }
    })
  }
}

const addEntry = (next: ([repl, session, field, value]: [REPLServer, Session, string, string]) => void) => {
  return ([repl, session, field, entry, description]: [REPLServer, Session, string, string, string]) => {
    session.addEntry({
      field,
      value: entry,
      date: new Date().toDateString(),
      description,
    })

    return next([repl, session, field, entry])
  }
}

export const entry = new Stack(checkActiveSession)
  .push(selectField)
  .push(enterEntryValue)
  .push(optionalAddDescription)
  .push(addEntry)
  .push(terminate)
  .get()
