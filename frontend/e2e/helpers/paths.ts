import path from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDirectory = path.dirname(fileURLToPath(import.meta.url))

export const frontendRoot = path.resolve(currentDirectory, '../..')
export const backendRoot = path.resolve(frontendRoot, '../backend')
export const distDirectory = path.join(frontendRoot, 'dist')
