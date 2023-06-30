import type { REPLServer } from 'repl'
import chalk from 'chalk'

import { addEntry } from '../../../services/tracker'

import { Session, question } from '../../utils'

const TAB = '  '

const selectField = async (repl: REPLServer, session: Session): Promise<string | undefined> => {
  const fields = session.data.fields

  if(fields.length === 0) {
    return undefined
  }

  const display = fields.reduce((display, { name, description }) => {
    return display
      + '\n' + TAB + chalk.bold(name)
      + '\n\n' + TAB + TAB + `Description: "${description}"` + '\n'
  }, '\n')

  const query = `Select the field you want to add an entry to: ${display}` + '\nField: '

  const selectedField = await question(repl, query)

  if(!fields.map((f) => f.name).includes(selectedField)) {
    const message = chalk.red(`"${selectedField}" is not one of the available fields`)
    console.log(message)
    return selectField(repl, session)
  }

  return selectedField
}

const enterEntryValue = (repl: REPLServer, field: string) => {
  const query = `Enter a value for "${field}": `
  return question(repl, query)
}

const optionalAddDescription = async (repl: REPLServer): Promise<string> => {
  const query = 'Would you like to add a description to this entry? (Y/n): '

  const answer = await question(repl, query)
  const parsed = answer.trim().toLowerCase()

  if(parsed === 'n') {
    return ''
  }

  if(parsed === 'y') {
    return question(repl, 'Enter a description: ')
  }

  console.log(chalk.red('Please answer with "y" or "n"\n'))

  return optionalAddDescription(repl)
}

export const entry = async (repl: REPLServer, session: Session | undefined) => {
  // checkActiveSession
  if(session === undefined) {
    console.error('Start a new session with ".load" or ".new" to use this command.')
    repl.displayPrompt()
    return
  }

  const selectedField = await selectField(repl, session)

  if(selectedField === undefined) {
    const error = chalk.red('No fields for this tracker yet.')
    const help = chalk.bold('Use .field to enter a field.')
    console.log('\n' + error + '\n\n' + help + '\n')
    repl.displayPrompt()
    return
  }

  const entry = await enterEntryValue(repl, selectedField)
  const description = await optionalAddDescription(repl)

  session.data = addEntry(session.data, {
    field: selectedField,
    value: entry,
    time: Date.now(),
    description,
  })

  console.log()
}