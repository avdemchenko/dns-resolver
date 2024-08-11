/**
 * Encodes a domain name into the DNS wire format.
 *
 * This function takes a domain name as input and encodes it into the DNS wire
 * format, which is used in DNS queries and responses. The domain name is split
 * into its labels (subdomains), and each label is prefixed with its length as
 * a single byte. The encoded domain name is terminated with a null byte (`0x00`).
 *
 * @param {string} domain - The domain name to encode (e.g., "example.com").
 *
 * @returns {Buffer} - A Buffer representing the encoded domain name in DNS wire format.
 */
export function encodeDomainName(domain: string) {
  const parts = domain.split('.')
  const buffers = parts.map((part) => {
    const length = Buffer.from([part.length])
    const content = Buffer.from(part, 'ascii')
    return Buffer.concat([length, content])
  })

  return Buffer.concat([...buffers, Buffer.from([0])])
}
