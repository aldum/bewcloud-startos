import { matches, FileHelper } from '@start9labs/start-sdk'

const { object, string } = matches

const shape = object({
})

export const store = FileHelper.json(
  {
    volumeId: 'main',
    subpath: '/store.json',
  },
  shape,
)
