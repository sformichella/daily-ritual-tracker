import { REPLServer } from 'repl'
import chalk from 'chalk'

import { Stack } from '../../stack'

import { addEntry } from '../../../services/tracker'

import {
  ActiveSessionArgs,
  checkActiveSession,
  terminate
} from '../utils'

type EnterFieldArgs = [...session: ActiveSessionArgs, fieldName: string]
type EnterEntryArgs = [...session: EnterFieldArgs, entryValue: string]
type EnterDescriptionArgs = [...fieldArgs: EnterEntryArgs, description: string]

const TAB = '  '

const selectField = (next: (args: EnterFieldArgs) => void) => {
  return ([repl, session]: ActiveSessionArgs) => {
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

const enterEntryValue = (next: (args: [REPLServer, string, string]) => void) => {
  return ([repl, field]: [REPLServer, string]) => {
    const query = `Enter a value for "${field}": `

    repl.question(query, (answer: string) => {
      return next([repl, field, answer])
    })
  }
}

const optionalAddDescription = (next: (args: EnterDescriptionArgs) => void) => {
  return ([repl, session, field, entry]: EnterEntryArgs) => {
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

const updateTracker = (next: (args: ActiveSessionArgs) => void) => {
  return ([repl, session, field, entry, description]: EnterDescriptionArgs) => {
    session.data = addEntry(session.data, {
      field,
      value: entry,
      date: new Date().toDateString(),
      description,
    })

    // A notion of a "passthrough" middleware would clean this up
    // a bit. It seems silly for this function to need to pass repl 
    // and session through just because a middleware down the line needs them
    return next([repl, session])
  }
}

// Example of what a passthrough might look like
// Pretty verbose at the moment, but it does simplify
// enterEntryValue such that it only works with values
// that it actually needs
const enterEntryValuePassthrough = (next: (args: EnterEntryArgs) => void) => {
  return (value: EnterFieldArgs) => {
    const nextWrapped = ([repl, field, desc]: [REPLServer, string, string]) => {
      return next([repl, value[1], field, desc])
    }

    return enterEntryValue(nextWrapped)([value[0], value[2]])
  }
}

export const entry = new Stack(checkActiveSession)
  .push(selectField)
  .push(enterEntryValuePassthrough)
  .push(optionalAddDescription)
  .push(updateTracker)
  .push(terminate)
  .get()
