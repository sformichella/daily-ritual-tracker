import { z } from 'zod'

import { ALPHA_NUMERIC_REGEX } from '../constants'

export const PathSchema = z.string()
  // .regex(ALPHA_NUMERIC_REGEX, {
  //   message: 'Path failed to pass regex check'
  // })
  .array()

export type PathSchema = z.infer<typeof PathSchema>
