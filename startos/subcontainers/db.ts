import { sdk } from '../sdk'
import { Effects } from '@start9labs/start-sdk/base/lib/Effects'
import { psqlUser } from '../utils/db'
import { storeType } from '../fileModels/store.json'

export const getEnv =
  async (store: storeType) => {
    const psqlPass = store.db_pass
    return {
      POSTGRES_PASSWORD: psqlPass,
      POSTGRES_USER: psqlUser,
    }
  }

export const mounts = sdk.Mounts.of()
  .mountVolume({
    volumeId: 'main',
    subpath: 'db',
    mountpoint: '/var/lib/postgresql/data',
    readonly: false
  })

export const getSubcontainer =
  async (effects: Effects, id: string = "db") =>
    await sdk.SubContainer.of(effects,
      { imageId: "db" },
      mounts,
      id
    )
