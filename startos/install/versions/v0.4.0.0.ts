import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'
import { sdk } from '../../sdk'
import { rm } from 'fs/promises'

export const v_0_4_0_0 = VersionInfo.of({
  version: '0.4.0:0',
  releaseNotes: 'Revamped for StartOS 0.4.0',
  migrations: {
    up: async ({ effects }) => {
      // delete old start9 dir from 0.3.5.1
      rm('/media/startos/volumes/main/start9', { recursive: true }).catch(
        console.error,
      )
    },
    down: IMPOSSIBLE,
  },
})
