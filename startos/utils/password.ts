import { utils } from '@start9labs/start-sdk'

export const defaultRandomString = {
  charset: 'a-z,A-Z,1-9',
  len: 22,
}

export const generatePassword = async (
  chars: string = defaultRandomString.charset,
  l: number = defaultRandomString.len
) => utils.getDefaultString(
  {
    charset: chars,
    len: l,
  }
)

export const hashPassword =
  async (basicAuthPassword: string, salt: string) =>
    await sha256hash(`${basicAuthPassword}:${salt}`)

export const sha256hash =
  async (value: string) => {
    const hashedValueData = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(value),
    )

    const hashedValue = Array.from(
      new Uint8Array(hashedValueData)).map(
        (byte) => byte.toString(16).padStart(2, '0'),
      ).join('')

    return hashedValue
  }
