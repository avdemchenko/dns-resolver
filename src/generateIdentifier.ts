import crypto from 'crypto'

export function generateIdentifier() {
  return crypto.randomBytes(2)
}
