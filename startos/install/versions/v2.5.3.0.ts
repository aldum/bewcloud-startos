import { VersionInfo, IMPOSSIBLE, T } from '@start9labs/start-sdk'

export const v_2_5_3_0 = VersionInfo.of({
  version: '2.5.3:0',
  releaseNotes: '',
  migrations: {
    up: async ({ effects }: { effects: T.Effects }) => {
    },
    down: IMPOSSIBLE,
  },
})
