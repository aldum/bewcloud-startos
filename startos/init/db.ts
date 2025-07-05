import { Effects } from '@start9labs/start-sdk/base/lib/Effects'
import * as dbSub from '../subcontainers/db'
import { unsafeReadStore } from '../fileModels/store.json'
import { sdk } from '../sdk'

export const createDb =
  async (effects: Effects) => {
    console.log('createDB read')
    const store = await unsafeReadStore()

    console.log('createDB getEn')
    const dbEnv = await dbSub.getEnv(store)

    await sdk.SubContainer.withTemp(effects,
      { imageId: "db" },
      dbSub.mounts,
      "create-db",
      (subC) => subC.execFail(
        ['docker-ensure-initdb.sh'],
        {
          env: dbEnv,
        }
      )
    )

  }
