import { sdk } from '../sdk'
import { Effects } from '@start9labs/start-sdk/base/lib/Effects'
import { psqlUser, psqlHost, uiPort } from '../utils'
import { storeType } from '../fileModels/store.json'

export const filesPath = '/app/data-files'

export const getEnv =
  async (store: storeType) => {
    const psqlPass = store.db_pass
    return {
      // these are not the same as the DB container's env
      POSTGRESQL_HOST: psqlHost,
      POSTGRESQL_USER: psqlUser,
      POSTGRESQL_DBNAME: psqlUser,
      POSTGRESQL_PASSWORD: psqlPass,

      PORT: `${uiPort}`,
      JWT_SECRET: store.jwt_secret,
      PASSWORD_SALT: store.salt,
    }
  }

export const mounts = sdk.Mounts.of()
  .mountVolume({
    volumeId: 'main',
    subpath: 'bewcloud',
    mountpoint: filesPath,
    readonly: false,
  })
  .mountVolume({
    volumeId: 'config',
    subpath: '/bewcloud.config.ts',
    mountpoint: '/app/bewcloud.config.ts',
    readonly: false,
    type: 'file',
  })

/**
 * @description While this is extracted, it's a bad idea to use it multiple times.
 */
export const getSubcontainer =
  async (effects: Effects) =>
    await sdk.SubContainer.of(effects,
      { imageId: 'bewcloud' },
      mounts,
      'bewcloud-sub',
    )
