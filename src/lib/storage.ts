import { CODE_PATTERN, generateCode } from './code'

const CODE_KEY = 'pd_code'

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null

  try {
    return window.localStorage
  } catch {
    return null
  }
}

function readCode(): string | null {
  try {
    return getStorage()?.getItem(CODE_KEY) ?? null
  } catch {
    return null
  }
}

function writeCode(code: string): void {
  try {
    getStorage()?.setItem(CODE_KEY, code)
  } catch {
    return
  }
}

export function readOrCreateCode(): string {
  const stored = readCode()

  if (stored && CODE_PATTERN.test(stored)) return stored

  const code = generateCode()
  writeCode(code)
  return code
}
