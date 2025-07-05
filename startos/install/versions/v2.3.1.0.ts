import { VersionInfo, IMPOSSIBLE, T } from '@start9labs/start-sdk'

export const v_2_3_1_0 = VersionInfo.of({
  version: '2.3.1:0',
  releaseNotes: '',
  migrations: {
    up: async ({ effects }: { effects: T.Effects }) => {
    },
    down: IMPOSSIBLE,
  },
})
