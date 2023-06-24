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
import { Session, ensureAppDirectory } from './utils'

export const repl = start()

ensureAppDirectory()

let session: Session | undefined

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
      ref,
      data
    }
    
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

    repl.displayPrompt()
    return
  }
})

repl.defineCommand('dir', {
  action: () => dir(repl)
})

repl.defineCommand('field', {
  action: () => field([repl, session])
})

repl.defineCommand('entry', {
  action: () => entry([repl, session])
})
