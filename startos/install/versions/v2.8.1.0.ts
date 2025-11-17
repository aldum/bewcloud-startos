import { VersionInfo, IMPOSSIBLE, T } from '@start9labs/start-sdk'

export const v_2_8_1_0 = VersionInfo.of({
  version: '2.8.1:0',
  releaseNotes: '',
  migrations: {
    up: async ({ effects }: { effects: T.Effects }) => {
    },
    down: IMPOSSIBLE,
  },
})
