export function parseDomainName(buffer: Buffer, offset: number) {
  let name = ''
  let hasEncounteredPointer = false
  let originalOffset = offset

  while (true) {
    const lengthByte = buffer[offset]

    if (isEndOfName(lengthByte)) {
      offset = offset + 1
      break
    }

    if (isPointerIndicator(lengthByte)) {
      if (!hasEncounteredPointer) {
        originalOffset = offset + 2
        hasEncounteredPointer = true
      }
      offset = calculatePointerOffset(lengthByte, buffer, offset)
      continue
    }

    const label = readLabel(buffer, offset, lengthByte)
    name = name + label + '.'
    offset = offset + lengthByte + 1
  }

  return {
    domainName: name,
    newOffset: hasEncounteredPointer ? originalOffset : offset,
  }
}

function isEndOfName(lengthByte: number) {
  return lengthByte === 0
}

function isPointerIndicator(lengthByte: number) {
  return (lengthByte & 0xc0) === 0xc0
}

function calculatePointerOffset(
  lengthByte: number,
  buffer: Buffer,
  currentOffset: number
) {
  return ((lengthByte & 0x3f) << 8) | buffer[currentOffset + 1]
}

function readLabel(buffer: Buffer, offset: number, length: number) {
  const startOfLabel = offset + 1
  const endOfLabel = startOfLabel + length

  return buffer.toString('ascii', startOfLabel, endOfLabel)
}
