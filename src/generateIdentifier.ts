import crypto from 'crypto'

/**
 * Generates a random 16-bit identifier for DNS queries.
 *
 * This function generates a 2-byte (16-bit) random identifier using
 * cryptographic randomness. The identifier is typically used in DNS queries
 * to uniquely identify the request and match responses.
 *
 * @returns {Buffer} - A Buffer containing a 2-byte random identifier.
 */
export function generateIdentifier() {
  return crypto.randomBytes(2)
}
