import { matches, FileHelper } from '@start9labs/start-sdk'
const { object, string } = matches

const shape = object({
  db_pass: string,
  jwt_secret: string,
  salt: string,
})

export const storeJson = FileHelper.json(
  {
    volumeId: 'main',
    subpath: '/store.json',
  },
  shape,
)
