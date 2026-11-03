const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const CODE_LENGTH = 6

export const CODE_PATTERN = /^DEV-[A-Z0-9]{6}$/

function randomIndices(length: number): Uint8Array {
  const values = new Uint8Array(length)
  const webCrypto = globalThis.crypto

  if (webCrypto && typeof webCrypto.getRandomValues === 'function') {
    webCrypto.getRandomValues(values)
    return values
  }

  for (let index = 0; index < length; index += 1) {
    values[index] = Math.floor(Math.random() * 256)
  }

  return values
}

export function generateCode(): string {
  const values = randomIndices(CODE_LENGTH)
  let suffix = ''

  for (const value of values) {
    suffix += ALPHABET[value % ALPHABET.length]
  }

  return `DEV-${suffix}`
}
