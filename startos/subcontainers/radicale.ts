import { sdk } from '../sdk'
import { Effects } from '@start9labs/start-sdk/base/lib/Effects'

export const davConfigPath = '/config/config'
export const collectionsPath = '/data/collections'

export const mounts = sdk.Mounts.of()
  .mountVolume({
    volumeId: 'main',
    subpath: 'radicale',
    mountpoint: '/data',
    readonly: false
  })
  .mountVolume({
    volumeId: 'config',
    subpath: '/radicale-config',
    mountpoint: davConfigPath,
    readonly: false,
    type: 'file',
  })


export const getSubcontainer =
  async (effects: Effects, id: string = "radicale") =>
    await sdk.SubContainer.of(effects,
      { imageId: "dav" },
      mounts,
      id
    )
