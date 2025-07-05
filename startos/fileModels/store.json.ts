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

/**
 * @description Read the store and throw an error if it's not present.
 * Since it should get created upon installation automatically, this is generally not a possible problem.
 * @returns storeJson
 *   */
export const unsafeReadStore = async () => {
  const store = await storeJson.read().once()
  if (!store) {
    throw new Error("Store is missing!")
  }
  return store
}
