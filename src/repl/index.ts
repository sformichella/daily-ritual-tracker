import * as console from 'console'
import { start } from 'repl'
import chalk from 'chalk'

import {
  createTracker,
  findByName,
  readTracker,
  updateTracker
} from '../services/tracker'

import { field, entry, dir } from './commands'

import {
  Session,
  displaySession,
  ensureAppDirectory,
  splash 
} from './utils'

let session: Session | undefined

ensureAppDirectory()
splash()
displaySession(session)

export const repl = start()

repl.defineCommand('new', {
  action: (name: string) => {
    if(session !== undefined) {
      console.log(chalk.red('Cannot create a new tracker while a tracker is loaded.'))
      repl.displayPrompt()
      return
    }

    const ref = createTracker(name)
    const data = readTracker(ref)

    session = {
      name,
      ref,
      data
    }

    repl.displayPrompt()
    return
  }
})

repl.defineCommand('load', {
  action: (name: string) => {
    if(session !== undefined) {
      console.log(chalk.red('Cannot load tracker while a tracker is already loaded.'))
      repl.displayPrompt()
      return
    }

    const ref = findByName(name)

    if(ref === undefined) {
      console.log(chalk.red(`No tracker found with name "${name}".`))
      repl.displayPrompt()
      return
    }

    const data = readTracker(ref)

    session = {
      name,
      ref,
      data
    }

    displaySession(session)
    
    repl.displayPrompt()
    return
  }
})

repl.defineCommand('close', {
  action: () => {
    if(session === undefined) {
      console.log(chalk.red('No tracker loaded.'))
      repl.displayPrompt()
      return
    }

    updateTracker(session.ref, session.data)

    session = undefined

    displaySession(session)
    repl.displayPrompt()
    return
  }
})

repl.defineCommand('dir', {
  action: () => {
    dir(repl)
    displaySession(session)
    repl.displayPrompt()
    return
  }
})

repl.defineCommand('field', {
  action: async () => {
    await field(repl, session)
    displaySession(session)
    repl.displayPrompt()
    return
  }
})

repl.defineCommand('entry', {
  action: async () => {
    await entry(repl, session)
    displaySession(session)
    repl.displayPrompt()
    return
  }
})
