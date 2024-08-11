export function encodeDomainName(domain: string) {
  const parts = domain.split('.')
  const buffers = parts.map((part) => {
    const length = Buffer.from([part.length])
    const content = Buffer.from(part, 'ascii')
    return Buffer.concat([length, content])
  })

  return Buffer.concat([...buffers, Buffer.from([0])])
}
