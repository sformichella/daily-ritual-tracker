import { tmpdir } from 'os'

export const APP_DIR = tmpdir().split('/').concat('daily-ritual-tracker')
export const JSON_EXTENSION = '.json'
