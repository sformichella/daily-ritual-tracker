import chalk from 'chalk'

import { Stack } from '../../stack'

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

const enterEntryValue = (next: (args: EnterEntryArgs) => void) => {
  return ([repl, session, field]: EnterFieldArgs) => {
    const query = `Enter a value for "${field}": `

    repl.question(query, (answer: string) => {
      return next([repl, session, field, answer])
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

const addEntry = (next: (args: ActiveSessionArgs) => void) => {
  return ([repl, session, field, entry, description]: EnterDescriptionArgs) => {
    session.addEntry({
      field,
      value: entry,
      date: new Date().toDateString(),
      description,
    })

    return next([repl, session])
  }
}

export const entry = new Stack(checkActiveSession)
  .push(selectField)
  .push(enterEntryValue)
  .push(optionalAddDescription)
  .push(addEntry)
  .push(terminate)
  .get()
