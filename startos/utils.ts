import { utils } from '@start9labs/start-sdk'

export const generatePassword = async (
  chars: string = 'a-z,A-Z,1-9',
  l: number = 22
) => utils.getDefaultString(
  {
    charset: chars,
    len: l,
  }
)

export const uiPort = 8080
export const sqlPort = 5432
export const psqlDaemonUser = "postgres"
export const psqlUser = "postgres"
