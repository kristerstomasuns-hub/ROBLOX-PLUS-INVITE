import { REDEEM_ORIGIN } from '../config'

export function inviteUrl(code: string): string {
  return `${REDEEM_ORIGIN}${code}`
}
