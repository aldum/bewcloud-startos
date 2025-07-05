import { Effects } from '@start9labs/start-sdk/base/lib/Effects'
import * as dbSub from '../subcontainers/db'
import { storeJson } from '../fileModels/store.json'

export const createDb =
  async (effects: Effects) => {
    const store = await storeJson.read().once()
    if (!store) {
      throw new Error("Store is missing!")
    }

    const db = await dbSub.getSubcontainer(effects)
    const dbEnv = await dbSub.getEnv(store)
    await db.execFail(['docker-ensure-initdb.sh'], {
      env: dbEnv,
    })

  }
