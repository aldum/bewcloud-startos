import { VersionInfo, IMPOSSIBLE, T } from '@start9labs/start-sdk'

export const v_2_7_0_0 = VersionInfo.of({
  version: '2.7.0:0',
  releaseNotes: '',
  migrations: {
    up: async ({ effects }: { effects: T.Effects }) => {
    },
    down: IMPOSSIBLE,
  },
})
