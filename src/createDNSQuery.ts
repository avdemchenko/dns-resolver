import { encodeDomainName } from './encodeDomainName'
import { generateIdentifier } from './generateIdentifier'

export function createDNSQuery(
  domain: string,
  identifier = generateIdentifier()
) {
  const flags = Buffer.from([0x00, 0x00])
  const questionCount = Buffer.from([0x00, 0x01])
  const answerRR = Buffer.from([0x00, 0x00])
  const authorityRR = Buffer.from([0x00, 0x00])
  const additionalRR = Buffer.from([0x00, 0x00])
  const encodedDomain = encodeDomainName(domain) // Encoded domain name
  const type = Buffer.from([0x00, 0x01]) // Query type (A record)
  const classBuffer = Buffer.from([0x00, 0x01]) // Query class (IN)

  const query = Buffer.concat([
    identifier,
    flags,
    questionCount,
    answerRR,
    authorityRR,
    additionalRR,
    encodedDomain,
    type,
    classBuffer,
  ])

  return query
}
