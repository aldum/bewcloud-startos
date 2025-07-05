import { T, VersionGraph } from '@start9labs/start-sdk'
import { current, other } from './versions'
import { storeJson } from '../fileModels/store.json'
import { generatePassword } from '../utils'

export const versionGraph = VersionGraph.of({
  current,
  other,
  preInstall: async (effects: T.Effects) => {
    const db_pass = "password"
    // await generatePassword('A-Z,1-9', 25)
    const jwt_secret =
      await generatePassword('a-f,0-9', 128)
    const salt =
      await generatePassword('a-f,0-9', 64)
    await storeJson.write(effects, {
      db_pass,
      jwt_secret,
      salt
    })
  },
})
